const _ = require('lodash');
const constants = require('../config/constants');

var privateMethods = {

	getPermissionsFromSession(req) {
		return (req.session.user && req.session.user.perms) ? req.session.user.perms : [];
	},

	hadPermission(desiredPermission, permissions) {
		if (!_.isEmpty(permissions)) {
			for (let perm of permissions) {
				if (perm.toUpperCase() === desiredPermission.toUpperCase() || perm.toUpperCase() === constants.PERMISSIONS.WEBAPP_SUPER_ADMIN.toUpperCase()) {
					return true;
				}
			}
		}
		return false;
	},

	getAllAllowedPrefixesFromString(prefix, perms) {
		const allowImpalaStr = prefix.replace(' #PREFIX', '');
		const permsWithPrefixes = _.filter(perms, p => p.includes(allowImpalaStr));
		return _.map(permsWithPrefixes, p => p.replace(allowImpalaStr, '').trim());
	},

	// Get list of of permitted prefixes via db table combo (derived from EXPLAIN query)
	//  inputs: dbTblMap  = [{ db: 'foo', table: 'bar' }, { db: 'db2', table: 'table2'}, {...}]
	//  		prefix    = 'Execute JOIN Impala Queries #PREFIX'
	//			perms 	  = user perms
	//	returns: { foo: true, db2: false, ...} depending on perms for each
	getDatabasePrivilegeMapPrefixFromDbTbl(dbTblMap, prefix, perms) {
		const allAllowedPrefixes = privateMethods.getAllAllowedPrefixesFromString(prefix, perms);
		let allowMap = {};
		_.each(dbTblMap, dbTbl => {
			const { db } = dbTbl;
			let allowed = false;
			_.each(allAllowedPrefixes, thisPrefix => {
				const dbPrefix = db.substr(0, thisPrefix.length);
				if (dbPrefix.toLowerCase() === thisPrefix.toLowerCase()) allowed = true;
			});
			allowMap[db] = allowed;

		});
		return allowMap;
	},

	hasUnrestrictedOnDBsInQuery(req, databases, perm, userPermissions = null) {
		let allowed = true;
		let perms, userId;
		if (userPermissions){
			perms = userPermissions;
			userId = 'user';
		} else {
			perms = privateMethods.getPermissionsFromSession(req);
			userId = req.session.user.id;
		}

		const hasSuperAdmin = perms.includes(constants.PERMISSIONS.WEBAPP_SUPER_ADMIN);
		if (hasSuperAdmin) return allowed;
		let permPrefix = perm.replace(' #DB', '');
		const permsWithPrefixes = _.filter(perms, p => p.includes(permPrefix));
		const allAllowedDbs = _.map(permsWithPrefixes, p => p.replace(permPrefix, '').trim());

		console.log(`${userId} is allowed to query ${allAllowedDbs}`);
		console.log(`${userId} is trying to query ${databases}`);
		if (databases.length === 0) {
			return true;
		} else {
			databases.forEach((db) => {
				let databaseAllowed = false;
				allAllowedDbs.forEach((allowedDb) => {
					if (!db || db === null) {
						databaseAllowed = true;
					} else if (allowedDb.toUpperCase() === db.toUpperCase()) {
						databaseAllowed = true;
					} else if (db === 'INVALIDATE_ALL') {
						databaseAllowed = false;
					}
				});
				if (!databaseAllowed) {
					allowed = false;
				}
			});
		}
		return allowed;
	},
};

module.exports = class permissions {

	static canPerformTransition(req, transition, preloadedPermissions) {
		let perms = preloadedPermissions || privateMethods.getPermissionsFromSession(req);
		return _.isNull(transition.perms) || perms.filter(v => transition.perms.indexOf(v) !== -1).length > 0 || perms.includes(constants.PERMISSIONS.WEBAPP_SUPER_ADMIN);
	}

	static allowCreateDatabase(req) {
		const perms = privateMethods.getPermissionsFromSession(req);
		return privateMethods.hadPermission(constants.PERMISSIONS.CAN_CREATE_PREFIXED_IMPALA_DATABASE, perms);
	}

	static canViewEntity(req, entity) {
		if (req.get('SSL_CLIENT_S_DN_CN') === constants.DARQ_EMAIL_SERVICE_USER) return true;
		let perms = privateMethods.getPermissionsFromSession(req);
		if (privateMethods.hadPermission(constants.PERMISSIONS.CAN_VIEW_AGENCY.replace('#ENTITY', entity), perms)) return true;
		if (privateMethods.hadPermission(constants.PERMISSIONS.CAN_VIEW_AGENCY_ALL, perms)) return true;
		return false;
	}

	static canCreatePrefixedDatabase(req, query) {
		return privateMethods.hasDatabasePrivilegePrefix(req, query, constants.PERMISSIONS.CAN_CREATE_PREFIXED_IMPALA_DATABASE);
	}

	static canCreateExternalPrefixedDatabase(req, query) {
		return privateMethods.hasDatabasePrivilegePrefix(req, query, constants.PERMISSIONS.CAN_LOAD_DATA_INTO_PREFIXED_IMPALA_TABLE);
	}

	static canLoadIntoPrefixedDatabaseTable(req, query) {
		return privateMethods.hasHdfsPathPrivilegePrefix(req, query);
	}

	static canDropPrefixedDatabaseTable(req, query) {
		return privateMethods.hasDatabasePrivilegePrefix(req, query, constants.PERMISSIONS.CAN_DROP_PREFIXED_IMPALA_DATABASE_TABLE);
	}

	static canExportUnlimited(req) {
		const perms = privateMethods.getPermissionsFromSession(req);
		return privateMethods.hadPermission(constants.PERMISSIONS.CAN_EXPORT_UNLIMITED, perms);
	}

	static hasPermission(req, permission) {
		return privateMethods.hadPermission(permission, privateMethods.getPermissionsFromSession(req));
	}

	static getAllowedEntities(req) {
		let allowedEntities = new Set();
		for (let permission of privateMethods.getPermissionsFromSession(req)) {
			let matchedEntity = permission.match(/View Agency (.*)/);
			if (matchedEntity && matchedEntity[1] !== 'ALL') {
				let entity = matchedEntity[1];
				allowedEntities.add(entity);
				allowedEntities.add(entity.toLowerCase());
				allowedEntities.add(entity.toUpperCase());
				allowedEntities.add(entity.charAt(0).toUpperCase() + entity.slice(1).toLowerCase());
			}
		}
		return Array.from(allowedEntities).sort();
	}

	static canViewAllAgencies(req) {
		let perms = privateMethods.getPermissionsFromSession(req);
		if (privateMethods.hadPermission(constants.PERMISSIONS.CAN_VIEW_AGENCY_ALL, perms)) return true;
		return false;
	}

	static getSandbox(req) {
		return (req.session.user && req.session.user.sandboxId) ? req.session.user.sandboxId : -1;
	}

	static isSuperAdmin(req) {
		let perms = privateMethods.getPermissionsFromSession(req);
		return privateMethods.hadPermission(constants.PERMISSIONS.WEBAPP_SUPER_ADMIN, perms);
	}

	static canViewAdvanaGroupTablePermission(req, advanaGroupPermissions) {
		let perms = privateMethods.getPermissionsFromSession(req);
		return _.reduce(advanaGroupPermissions, (m, perm) => m || privateMethods.hadPermission(perm, perms), false);
	}

	static isDARQAgencyAdmin(req) {
		const { agency } = req.body;
		const perms = req.session.user ? req.session.user.perms : null;
		const adminPerm = `DARQ ${agency} Admin`;
		return agency && perms && _.includes(perms, adminPerm);
	}

	static canSelfAssign(req, prefix = '') {
		return privateMethods.hadPermission(prefix + constants.PERMISSIONS.CAN_WORKFLOW_SELF_ASSIGN, privateMethods.getPermissionsFromSession(req));
	}
};
