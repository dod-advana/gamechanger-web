'use strict';

// external imports
const _ = require('lodash');
const redis = require('redis');
const Sequelize = require('sequelize');
const underscore = require('underscore');

// internal imports
const eventHistory = require('./eventHistory');
const LOGGER = require('../lib/logger');
const Permission = require('../models').permission;
const permissions = require('./permissions');
const role = require('../models').role;
const user = require('../models').user;
const constants = require('../config/constants');
const user_app_versions = require('../models').user_app_versions;

const logger = LOGGER;
const client = redis.createClient(process.env.REDIS_URL || 'redis://localhost');

let privateMethods = {

	findAllUsers() {
		return new Promise(function (resolve, reject) {
			let sql = `
				select u.id, u.username, u.displayname, u.lastlogin, u.sandbox_id, u.disabled, u.email,
					r.id as roleid, p.id as permid
				from users u
				left join userroles ur on u.id = ur.userid
				left join roles r on ur.roleid = r.id
				left join roleperms rp on r.id = rp.roleid
				left join permissions p on rp.permissionid = p.id
				order by u.id, r.id, p.id
			`;
			db.game_changer.query(sql, { type: Sequelize.QueryTypes.SELECT, raw: true }).then(rows => {
				let users = [];
				let user = {};
				let role = {};
				for (let row of rows) {
					if (row.id !== user.id) {
						user = { ...row, roles: [] };
						users.push(user);
						role = {};
					}
					if (row.roleid && row.roleid !== role.id) {
						role = { id: row.roleid, permissions: [] };
						user.roles.push(role);
					}
					if (role.id !== undefined) {
						role.permissions.push({ id: row.permid });
					}
				}
				resolve(users);
			});
		});
	},

	findUsersByUsernames(usernames) {
		return new Promise(function (resolve, reject) {
			user.findAll({
				where: {
					username: {
						$in: usernames,
					},
				},
				attributes: ['username', 'displayname'],
			})
				.then(resolve)
				.catch(reject);
		});
	},

	findUser(userId) {
		return new Promise(function (resolve, reject) {
			user.findAll({
				where: { id: userId },
				include: [{
					model: role,
					attributes: ['id', 'name'],
					include: [{ model: Permission, attributes: ['id', 'name'] }]
				}],
				order: [
					[{ model: role }, 'name', 'asc']
				]
			}).then(user => {
				resolve(user);
			});
		});
	},

	findUserByUsername(username) {
		return new Promise(function (resolve, reject) {
			user.findAll({
				where: { username: username },
				include: [{
					model: role,
					attributes: ['id', 'name'],
					include: [{ model: Permission, attributes: ['id', 'name'] }]
				}]
			}).then(user => {
				resolve(user);
			});
		});
	},

	getPermissions(roles) {
		return new Promise(function (resolve, reject) {
			Permission.findAll({
				attributes: ['name'],
				where: { id: roles }
			}).then(permissions => {
				resolve(permissions);
			});
		});
	},

	getRoles(req) {
		return new Promise(function (resolve, reject) {
			let sql = `
				select r.id as roleid, r.name as rolename, p.id as permid, p.name as permname
				from roles r
				left join roleperms rp on r.id = rp.roleid
				left join permissions p on rp.permissionid = p.id
				${permissions.isSuperAdmin(req) ? '' :
		'where r.name <> \'Super Admin\' and p.name <> \'Webapp Super Admin\''}
				order by r.name, p.name
			`;
			db.game_changer.query(sql, { type: Sequelize.QueryTypes.SELECT, raw: true }).then(rows => {
				let roles = [];
				let role = {};
				for (let row of rows) {
					if (row.roleid !== role.id) {
						role = { id: row.roleid, name: row.rolename, permissions: [] };
						roles.push(role);
					}
					role.permissions.push({ id: row.permid, name: row.permname });
				}
				resolve(roles);
			});
		});
	},

	getRoleByTransitionToStatusId(toStatusId) {
		return new Promise(function (resolve, reject) {
			Transition.findAll({
				attributes: ['perms'],
				where: {
					fromStatusId: toStatusId,
				}
			}).then(perms => {
				Permission.findAll({
					attributes: ['id'],
					where: { name: perms.perms }
				}).then(permId => {
					roleperm.findAll({
						attributes: ['roleid'],
						where: { permissionid: permId[0].id }
					}).then(roleId => {
						role.findAll({
							attributes: ['name'],
							where: { id: roleId[0].roleid }
						}).then(roleName => {
							resolve(roleName);
						});
					});
				});
			});
		});
	},

	getUserRoles(userId) {
		return new Promise(function (resolve, reject) {
			userrole.findAll({
				attributes: ['roleid'],
				where: { userid: userId }
			}).then(userroles => {
				resolve(userroles);
			});
		});
	},

	insertUser(userInfo, creatorId) {
		return new Promise(function (resolve, reject) {
			user.create({
				username: userInfo.username,
				displayname: userInfo.displayname,
				sandbox_id: _.isEmpty(userInfo.sandbox_id) ? null : userInfo.sandbox_id,
				email: userInfo.email,
				subAgency: userInfo.subAgency,
			}).then(userObj => {
				var rows = [];
				for (let id of userInfo.roleIds) {
					rows.push({
						userid: userObj.id,
						roleid: id
					});
				}

				userrole.bulkCreate(rows).then(resObj => {
					eventHistory.create({
						userCn: creatorId,
						objectId: userObj.dataValues.id,
						table: user.getTableName(),
						action: eventHistory.actions.create,
						newValue: JSON.stringify({ username: userInfo.username }),
					});
					resolve(resObj);
				});
			}).catch(err => {
				logger.error(err);
				reject(err);
			});
		});
	},

	killSession(userid) {
		return new Promise(function (resolve, reject) {
			user.findAll({
				attributes: ['id', 'session_id'],
				where: {
					id: userid
				}
			}).then(resObj => {
				client.del('sess:' + resObj.dataValues.session_id, redis.print);
				user.update(
					{ session_id: null },
					{
						where: { id: resObj.dataValues.id }
					}).then(result => {
					return resolve(result);
				}).catch(e => {
					logger.error(e);
					reject(e);
				});
			}).catch(e => {
				logger.error(e);
				reject(e);
			});
		});
	},

	updateUser(userid, updateParams, sessionUser, oldUser = null) {
		return new Promise(function (resolve, reject) {
			let updatedUser = {};

			if (!_.isNil(updateParams.displayname))
				updatedUser['displayname'] = updateParams.displayname;
			if (!_.isNil(updateParams.username))
				updatedUser['username'] = updateParams.username;
			if (!_.isNil(updateParams.lastlogin))
				updatedUser['lastlogin'] = updateParams.lastlogin;
			if (!_.isNil(updateParams.sandbox_id))
				updatedUser['sandbox_id'] = updateParams.sandbox_id;
			if (!_.isNil(updateParams.disabled))
				updatedUser['disabled'] = updateParams.disabled;
			if (!_.isNil(updateParams.session_id))
				updatedUser['session_id'] = updateParams.session_id;
			if (!_.isNil(updateParams.email))
				updatedUser['email'] = updateParams.email;
			if (!_.isNil(updateParams.subAgency))
				updatedUser['subAgency'] = updateParams.subAgency.trim();

			user.update(updatedUser, { where: { id: userid } }).then(userObj => {
				const changesToLog = _.omit(updatedUser, 'lastlogin', 'session_id');

				if (!_.isEmpty(changesToLog)) {
					const oldValues = Object.keys(updatedUser).reduce((reducer, field) => {
						reducer[field] = oldUser[field];
						return reducer;
					}, {});

					eventHistory.create({
						userCn: sessionUser.id,
						objectId: userid,
						table: user.getTableName(),
						action: eventHistory.actions.update,
						oldValue: JSON.stringify(oldValues),
						newValue: JSON.stringify(changesToLog),
					})
						.catch(logger.error);
				}

				resolve(userObj);
			}).catch(e => {
				logger.error(e);
				reject(e);
			});
		});
	},

	updateUserSandbox(userid, roleid) {
		return new Promise(function (resolve, reject) {
			user.findAll({
				where: { id: userid }
			}).then(userObj => {
				if (!_.isNil(userObj.sandbox_id)) {
					resolve();
					return;
				}
				role.findAll({
					where: { id: roleid },
					include: [{ model: Permission, attributes: ['name'] }]
				}).then(role => {
					_.each(role.permissions, permission => {
						let permPrefix = 'View Agency ';
						if (_.startsWith(permission.name, permPrefix)) {
							let agency = permission.name.substring(permPrefix.length);
							let sql = 'select sandbox from agency_sandbox where agency = :agency';
							let replacements = { agency: agency };
							db.game_changer.query(sql, { replacements: replacements, type: Sequelize.QueryTypes.SELECT }).then(sandboxResults => {
								if (sandboxResults.length === 1) {
									user.update({ sandbox_id: sandboxResults[0].sandbox }, { where: { id: userid } }).then(updatedUser => {
										resolve();
										return;
									}).catch(e => {
										logger.error(e);
										reject(e);
									});
								}
								resolve();
								return;
							}).catch(e => {
								logger.error(e);
								reject(e);
							});
						}
					});
				}).catch(e => {
					logger.error(e);
					reject(e);
				});
			}).catch(e => {
				logger.error(e);
				reject(e);
			});
		});
	},

	getUsers(req, res) {
		let replacements = {};

		let leftJoinUsersRole = '';
		let andUsersRoleId = '';
		if (req.body.role) {
			replacements['desiredRole'] = req.body.role;
			leftJoinUsersRole = `LEFT JOIN userroles AS r ON u.id = r.userid`;
			andUsersRoleId = `AND r.roleid=(SELECT id from roles where name = :desiredRole)`;
		}

		let andILIKEDisplayName = '';
		if (req.body.searchTerm) {
			replacements['searchTerm'] = `%${req.body.searchTerm}%`;
			andILIKEDisplayName = `AND u.displayname ILIKE :searchTerm`;
		}

		let andNotSelectedUserCN = '';
		let unionSelectedUserCN = '';
		if (req.body.selectedUserCN) {
			replacements['selectedUserCN'] = req.body.selectedUserCN;

			if (req.body.role) {
				andNotSelectedUserCN = `AND u.username <> :selectedUserCN`;
			}
			unionSelectedUserCN = `
				UNION (
					SELECT username, displayname, sub_agency, 0 AS priority
					FROM users 
					WHERE username = :selectedUserCN
				)`;
		}

		let sql = `
		SELECT DISTINCT u.username, u.displayname, u.sub_agency, 1 AS priority
		FROM users AS u
		${leftJoinUsersRole}
		WHERE 
			u.disabled != true
			${andUsersRoleId}
			${andNotSelectedUserCN}
			${andILIKEDisplayName}
		${unionSelectedUserCN}
		ORDER BY priority, username ASC
		${parseInt(req.body.limit, 10) > 0 ? 'LIMIT ' + req.body.limit : ''}
		${parseInt(req.body.offset, 10) > 0 ? 'OFFSET ' + req.body.offset : ''}`;

		db.game_changer.query(sql, { replacements: replacements, type: Sequelize.QueryTypes.SELECT }).then(records => {
			return res.status(200).send(records);
		}).catch(e => {
			logger.error(e);
			return res.status(400).send({ status: 400, message: 'An error occured in the User Application API', code: '94CD061' });
		});
	},

	canCreateUserRole(req) {
		const { roleName, roleid } = req.body;
		const isDarqAdminRole = roleName => roleName.startsWith('DARQ') && roleName.endsWith('Admin') && !roleName.endsWith('User Admin') && !roleName.endsWith('Group Admin');

		function Result(result, msg) {
			this.canCreateUserRole = result;
			this.cantCreateUserRoleMsg = msg;
		}

		return new Promise((resolve, reject) => {
			if (isDarqAdminRole(roleName)) {
				userrole.findAll({ where: { roleid } })
					.then(userroles => {
						let agency = roleName.split(' ')[1];
						if (userroles.length === (agency.includes('army') || agency.includes('navy') ? 50 : 10))
							resolve(new Result(false, 'maximumDARQAdmins'));
						else
							resolve(new Result(true, null));
					})
					.catch(err => reject(new Result(false, err)));
			} else {
				resolve(new Result(true, null));
			}
		});
	},

	findAppVersionByUser(username, app) {
		return new Promise((resolve, reject) => {
			user_app_versions.findOne({ 
				where: {
					username: username,
					app_name: app
				}
			}).then((result) => {
				resolve (result);
			}).catch(e => {
				logger.error(e);
				reject(e);
			});
		})
	},

	updateAppVersion(username, app, currentVersion) {
		return new Promise((resolve, reject) => {
			user_app_versions.update(
				{
					version: currentVersion
				},
				{ 
					where: {
						username: username,
						app_name: app
					}
				}
			).then((update) => {
				resolve(update);
			}).catch(e => {
				logger.error(e);
				reject(e);
			});
		});
	},

	addNewAppVersion(username, app, currentVersion) {
		return new Promise((resolve, reject) => {
			user_app_versions.create({ 
				username: username,
				app_name: app,
				version: currentVersion
			})
			.then(resObj => { 
				resolve(resObj);
			})
			.catch(err => { 
				reject(err);
			});
		})
	}
};

module.exports = {

	createPermission(req, res) {
		Permission.create({
			name: req.body.name
		}).then(resObj => {
			eventHistory.create({
				userCn: req.session.user.id,
				objectId: resObj.dataValues.id,
				table: Permission.getTableName(),
				action: eventHistory.actions.create,
				newValue: JSON.stringify({ name: req.body.name, }),
			});
			res.status(200).send(resObj);
		}).catch(e => {
			logger.error(e);
			return res.status(400).send({ status: 400, message: 'An error occured in the User Application API', code: '02705E8' });
		});
	},

	createRole(req, res) {
		role.create({
			name: req.body.name
		}).then(createdRole => {
			var rows = [];
			for (let permissionid of req.body.permissionids) {
				rows.push({
					roleid: createdRole.id,
					permissionid: permissionid
				});
			}

			roleperm.bulkCreate(rows).then(resObj => {
				eventHistory.create({
					userCn: req.session.user.id,
					objectId: createdRole.id,
					table: role.getTableName(),
					action: eventHistory.actions.create,
					newValue: JSON.stringify({ name: req.body.name, }),
				});
				res.status(200).send(resObj);
			});
		}).catch(e => {
			logger.error(e);
			return res.status(400).send({ status: 400, message: 'An error occured in the User Application API', code: '03B9FF2' });
		});
	},

	createRolePerm(req, res) {
		roleperm.create({
			roleid: req.body.roleid,
			permissionid: req.body.permissionid
		}).then(resObj => {
			eventHistory.create({
				userCn: req.session.user.id,
				objectId: resObj.dataValues.id,
				table: roleperm.getTableName(),
				action: eventHistory.actions.create,
				newValue: JSON.stringify({
					roleid: req.body.roleid,
					permissionid: req.body.permissionid,
				}),
			});
			res.status(200).send(resObj);
		}).catch(e => {
			logger.error(e);
			return res.status(400).send({ status: 400, message: 'An error occured in the User Application API', code: '805687A' });
		});
	},

	createRolePerms(req, res) {
		var rows = [];
		for (let permissionid of req.body.permissionids) {
			rows.push({
				roleid: req.body.roleid,
				permissionid: permissionid
			});
		}
		roleperm.bulkCreate(rows).then(resObj => {
			res.status(200).send(resObj);
		}).catch(e => {
			logger.error(e);
			return res.status(400).send({ status: 400, message: 'An error occured in the User Application API', code: 'FB7B4DF' });
		});
	},

	createUser(req, res) {
		if (_.isNil(req.body.username))
			return res.status(400).send({ status: 400, message: 'username must be provided' });
		else if (_.isNil(req.body.displayname))
			return res.status(400).send({ status: 400, message: 'displayname must be provided' });
		else if (_.isNil(req.body.sandbox_id))
			return res.status(400).send({ status: 400, message: 'sandbox_id must be provided' });

		privateMethods.findUserByUsername(req.body.username).then(resObj => {
			if (_.isNil(resObj)) {
				privateMethods.insertUser(req.body, req.session.user.id).then(resObj => {
					return res.status(201).send(resObj);
				}).catch(e => {
					return res.status(500).send({ error: e });
				});
			} else {
				return res.status(400).send({ status: 400, message: 'user already exists' });
			}
		});
	},

	createUserInternal(props) {
		return new Promise(function (resolve, reject) {
			if (!(props.username) || !(props.displayname)) {
				reject('username and displayname must be provided');
				return;
			}
			user.create({
				username: props.username,
				displayname: props.displayname,
				lastlogin: Sequelize.literal('CURRENT_TIMESTAMP'),
				session_id: props.session_id
			}).then(resObj => {
				resolve(resObj);
			}).catch(e => {
				logger.error(e);
				reject(e);
			});
		});
	},

	createUserRole(req, res) {
		privateMethods.canCreateUserRole(req)
			.then(({ canCreateUserRole, cantCreateUserRoleMsg }) => {
				if (canCreateUserRole) {
					userrole.create({
						userid: req.body.userid,
						roleid: req.body.roleid
					}).then(function ({ dataValues }) {
						privateMethods.killSession(req.body.userid).then(() => {
							eventHistory.create({
								userCn: req.session.user.id,
								table: userrole.getTableName(),
								objectId: dataValues.id,
								action: eventHistory.actions.create,
								newValue: JSON.stringify({
									userid: req.body.userid,
									roleid: req.body.roleid,
								}),
							}).then(() => {
								privateMethods.updateUserSandbox(req.body.userid, req.body.roleid).then(() => {
									return res.status(200).send('User role added');
								}).catch(e => {
									logger.error(e);
									return res.status(400).send({ status: 400, message: 'An error occured in the User Application API', code: 'BCBE396' });
								});
							});
						}).catch(e => {
							logger.error(e);
							return res.status(400).send({ status: 400, message: 'An error occured in the User Application API', code: 'CBE396B' });
						});
					}).catch(e => {
						logger.error(e);
						return res.status(400).send({ status: 400, message: 'An error occured in the User Application API', code: 'BCE369B' });
					});
				} else {
					logger.error(cantCreateUserRoleMsg);
					return res.status(400).send({ status: 400, message: cantCreateUserRoleMsg, code: '77OVF5Q' });
				}
			})
			.catch(e => {
				logger.error(e);
				return res.status(400).send({ status: 400, message: 'An error occured in the User Application API', code: '8OGY8EP' });
			});
	},

	getAllPermissions(req, res) {
		let where = permissions.isSuperAdmin(req) ? {} : { name: { $not: 'Webapp Super Admin' } };
		Permission.findAll({
			order: 'name ASC',
			attributes: ['id', 'name'],
			where: where
		}).then(permissions => {
			return res.status(200).send(permissions);
		});
	},

	getAllRoles(req, res) {
		privateMethods.getRoles(req).then(resObj => {
			return res.status(200).send(resObj);
		}).catch(e => {
			logger.error(e);
			return res.status(400).send({ status: 400, message: 'An error occured in the User Application API', code: 'bad5eec7' });
		});
	},

	getDARQRolesByAgency(req, res) {
		const agency = req.params.agency.toLowerCase();
		role.findAll({
			where: {
				$or: [
					{ name: `DARQ ${agency} Admin` },
					{ name: { $like: `DARQ ${agency} Coordinator%` } },
					{ name: `DARQ ${agency} HQ` },
					{ name: `DARQ ${agency} Tester` },
					{ name: `DARQ ${agency} View Only` },
					{ name: { $like: `DARQ ${agency} Reviewer%` } },
					{ name: `DARQ ${agency} Group Admin` },
					{ name: `DARQ ${agency} User Admin` },
				],
			},
			attributes: ['id', 'name'],
		})
			.then(roles => res.status(200).send(roles))
			.catch(e => {
				logger.error(e);
				return res.status(400).send({ status: 400, message: 'An error occured in the User Application API', code: '8ECDDAC' });
			});
	},

	getAllUsers(req, res) {
		privateMethods.findAllUsers().then(resObj => {
			return res.status(200).send(resObj);
		}).catch(e => {
			logger.error(e);
			return res.status(400).send({ status: 400, message: 'An error occured in the User Application API', code: '5AA9557' });
		});
	},

	getPermissions(req, res) {
		if (_.isNil(req.params.roles))
			return res.status(400).send({ status: 400, message: 'roles must be provided' });
		privateMethods.getPermissions(req.params.roles).then(resObj => {
			return res.status(200).send(resObj);
		});
	},

	getRoleCounts(req, res) {
		var sql = 'SELECT DISTINCT a.id, a.name, COUNT(b.id) as usercount FROM roles a LEFT JOIN userroles b ON a.id = b.roleid ';
		var where = '';
		switch (req.params.category) {
			case 'agencies':
				where = 'WHERE UPPER(a.name) NOT LIKE \'%ADMIN%\' ';
				where += 'AND UPPER(a.name) NOT LIKE \'BUCKETING%\' ';
				where += 'AND UPPER(a.name) NOT LIKE \'DATABASE%\' ';
				where += 'AND UPPER(a.name) NOT LIKE \'DATASTAR%\' ';
				where += 'AND UPPER(a.name) NOT LIKE \'DATA UPLOAD%\' ';
				where += 'AND UPPER(a.name) NOT LIKE \'FSD %\' ';
				where += 'AND UPPER(a.name) NOT LIKE \'NFR %\' ';
				where += 'AND UPPER(a.name) NOT LIKE \'DARQ%\' ';
				where += 'AND UPPER(a.name) NOT LIKE \'QLIK%\' ';
				where += 'AND UPPER(a.name) NOT LIKE \'%REVIEWER%\' ';
				where += 'AND UPPER(a.name) NOT LIKE \'STREAMSETS%\' ';
				where += 'AND UPPER(a.name) NOT LIKE \'TRIFACTA%\' ';
				where += 'AND UPPER(a.name) NOT LIKE \'UA %\' ';
				where += 'AND UPPER(a.name) NOT LIKE \'USER %\' ';
				break;
			case 'apps':
				where = 'WHERE UPPER(a.name) LIKE \'BUCKETING%\' ';
				where += 'OR UPPER(a.name) LIKE \'DATABASE%\' ';
				where += 'OR UPPER(a.name) LIKE \'DATASTAR%\' ';
				where += 'OR UPPER(a.name) LIKE \'DATA UPLOAD%\' ';
				where += 'OR UPPER(a.name) LIKE \'DARQ%\' ';
				where += 'OR UPPER(a.name) LIKE \'QLIK%\' ';
				where += 'OR UPPER(a.name) LIKE \'STREAMSETS%\' ';
				where += 'OR UPPER(a.name) LIKE \'TRIFACTA%\' ';
				where += 'OR UPPER(a.name) LIKE \'UA %\' ';
				where += 'OR UPPER(a.name) LIKE \'USER %\' ';
				break;
			case 'admins':
				where = 'WHERE UPPER(a.name) LIKE \'%ADMIN%\' ';
				break;
			default:
				break;

		}
		sql += where;
		sql += 'GROUP BY a.id, a.name ORDER BY a.name asc';
		db.game_changer.query(sql, { type: Sequelize.QueryTypes.SELECT })
			.then(users => {
				return res.status(200).send(users);
			}).catch(e => {
				logger.error(e);
				return ({ message: 'An error occured in the User Application API' });
			});
	},

	getUser(req, res) {
		if (_.isNil(req.params.userid) || isNaN(req.params.userid)) return res.status(400).send({ status: 400, message: 'Valid numeric userid is required' });
		privateMethods.findUser(req.params.userid).then(resObj => {
			res.status(200).send(resObj);
		}).catch(e => {
			logger.error(e);
			return res.status(400).send({ status: 400, message: 'An error occured in the User Application API', code: '30DDE8C' });
		});
	},

	getUserInternal(userid) {
		return new Promise(function (resolve, reject) {
			privateMethods.findUserByUsername(userid).then(resObj => {
				resolve(resObj);
			}).catch(e => {
				logger.error(e.message);
				return 'An error occured in the User Application API';
			});
		});
	},

	removeRolePerm(req, res) {
		if (_.isNil(req.params.roleid) || isNaN(req.params.roleid)) return res.status(400).send({ status: 400, message: 'Valid numeric roleid is required' });
		if (_.isNil(req.params.permissionid) || isNaN(req.params.permissionid)) return res.status(400).send({ status: 400, message: 'Valid numeric permissionid is required' });
		roleperm.destroy({
			where: {
				roleid: req.params.roleid,
				permissionid: req.params.permissionid
			}
		}).then(() => {
			eventHistory.create({
				userCn: req.session.user.id,
				table: roleperm.getTableName(),
				action: eventHistory.actions.delete,
				oldValue: JSON.stringify({
					roleid: req.params.roleid,
					permissionid: req.params.permissionid,
				}),
			});
			res.status(200).send('Role permission mapping deleted');
		}).catch(e => {
			logger.error(e);
			return res.status(400).send({ status: 400, message: 'An error occured in the User Application API', code: '7B29E10' });
		});
	},

	async removeUserRole(req, res) {
		try {
			if (_.isNil(req.params.userid) || isNaN(req.params.userid)) return res.status(400).send({ status: 400, message: 'Valid numeric userid is required' });
			if (_.isNil(req.params.roleid) || isNaN(req.params.roleid)) return res.status(400).send({ status: 400, message: 'Valid numeric roleid is required' });

			let canRemoveDarqRole = await darqUtils.canRemoveDarqRole(req.params.userid, req.params.roleid);
			if (!canRemoveDarqRole) {
				return res.status(400).send({ status: 400, message: 'This role cannot be removed because user has DAR-Q assignments in this role' });
			}

			await userrole.destroy({
				where: {
					userid: req.params.userid,
					roleid: req.params.roleid
				}
			});
			await privateMethods.killSession(req.params.userid);
			await eventHistory.create({
				userCn: req.session.user.id,
				table: userrole.getTableName(),
				action: eventHistory.actions.delete,
				oldValue: JSON.stringify({
					userid: req.params.userid,
					roleid: req.params.roleid,
				})
			});
			return res.status(200).send('User role removed');
		} catch (e)  { return ApiError.send400(req, res, e, '0166bf58'); }
	},

	updateUser(req, res) {
		if (_.isNil(req.params.userid) || isNaN(req.params.userid))
			return res.status(400).send({ status: 400, message: 'Valid numeric userid is required' });
		privateMethods.findUser(req.params.userid).then(user => {
			if (_.isNil(user))
				return res.status(400).send({ status: 400, message: 'No user ' + req.params.userid + ' found' });
			privateMethods.updateUser(req.params.userid, req.body, req.session.user, user).then(resObj => {
				privateMethods.killSession(req.params.userid).then(() => {
					return res.status(200).send(resObj);
				});
			}).catch(e => {
				console.log(e);
				logger.error(e);
				return res.status(400).send({ status: 400, message: 'An error occured in the User Application API', code: '26881AE' });
			});
		});
	},

	updateUserInternal(userid, session_id) {
		let params = {
			lastlogin: Sequelize.literal('CURRENT_TIMESTAMP'),
			session_id: session_id
		};
		return new Promise(function (resolve, reject) {
			privateMethods.updateUser(userid, params).then(resObj => {
				resolve(resObj);
			}).catch(e => {
				logger.error(e);
				reject(e);
			});
		});
	},

	userSearch(req, res) {
		if (req.body.toStatusId) { // variance ticketing
			privateMethods.getRoleByTransitionToStatusId(req.body.toStatusId).then(roleName => {
				req.body.role = roleName[0].name;
				privateMethods.getUsers(req, res);
			});
		} else {
			privateMethods.getUsers(req, res);
		}
	},

	getPermissionsByRoleName(roleName) {
		return new Promise(function (resolve, reject) {
			role.findAll({
				attributes: ['permissions.name'],
				include: [{ model: Permission }],
				where: { name: roleName },
				raw: true
			}).then(permissions => {
				resolve(underscore.pluck(permissions, 'name'));
			}).catch(e => {
				logger.error(e);
				reject(e);
			});
		});
	},

	async getUsersByPermission(permissionName) {
		let options = {
			attributes: ['username', 'displayname', 'email', 'id', 'sub_agency'],
			order: [['displayname', 'ASC']],
			where: {
				disabled: {
					$ne: true
				}
			},
			include: [{
				model: role,
				attributes: [],
				include: [{
					model: Permission,
					where: { name: permissionName }
				}]
			}],
			raw: true
		};

		return user.findAll(options);
	},
	async getUsersByRole(req, res) {
		let options = {
			attributes: ['username', 'displayname', 'email', 'id', 'sub_agency'],
			order: [['displayname', 'ASC']],
			where: {
				disabled: {
					$ne: true
				}
			},
			raw: true
		};

		if (req.body.role)
			options['include'] = [
				{
					model: role,
					where: { name: req.body.role },
					attributes: []
				}];

		if (req.body.hasBeenAssignedRecordOnly) {
			let currentPeriod;
			try {
				const results = await UserPrefs.getUserPref('system', 'darq_current_period');
				currentPeriod = results.prefValue.label;
			} catch (e) { return ApiError.send400(req, res, e, 'cb6d8a92'); }

			options.where['$or'] = [
				{
					[`extra_fields.hasBeenAssignedRecord${currentPeriod}`]: 'true'
				},
				{
					[`extra_fields.hasBeenAssignedRecord|${currentPeriod}|${req.body.role}`]: 'true'
				}
			];
		}

		user.findAll(options).then(options => {
			return res.status(200).send(options);
		}).catch(e => {
			logger.error(e);
			return res.status(400).send({ status: 400, message: 'An error occured in the User Application API', code: '94CG061' });
		});
	},

	async getUsersByDARQAgency(req, res) {
		let agency = req.params.agency.toLowerCase();

		const where = {
			disabled: { $not: true },
		};

		// get current period info
		let currentPeriod;
		try {
			const results = await UserPrefs.getUserPref('system', 'darq_current_period');
			currentPeriod = results.prefValue.label;
		} catch (e) { return ApiError.send400(req, res, e, 'e24ac858'); }

		user.findAll({
			attributes: ['id', 'username', 'displayname', 'email', 'subAgency', 'extra_fields'],
			where,
			include: [
				{
					model: role,
					attributes: ['name'],
					where: {
						name: { $like: `DARQ ${agency} %` }
					}
				},
				{
					model: darq_group,
					required: false,
					where: { agency }
				}
			],
			order: [
				['displayname', 'asc']
			]
		}).then(users => {

			if (req.query.hasBeenAssignedRecord) {
				users = users.filter(user => user.roles.find(r => r.name.includes('Coordinator')) ||
					(user.extra_fields && Object.keys(user.extra_fields).find(key => key.startsWith(`hasBeenAssignedRecord|${currentPeriod}`))));
			}

			return res.status(200).send(users);
		}).catch(e => {
			logger.error(e);
			return res.status(400).send({ status: 400, message: 'An error occured in the User Application API', code: '91CH061' });
		});
	},

	getUsersByUsernames(req, res) {
		const { usernames } = req.body;

		if (!Array.isArray(usernames))
			return res.status(400).send({ message: 'An error occured in the User Application API', code: '14IV0BF' });

		privateMethods.findUsersByUsernames(usernames)
			.then(users => res.status(200).send(users))
			.catch(e => {
				logger.error(e);
				return res.status(400).send({ message: 'An error occured in the User Application API', code: '14OV0BB' });
			});
	},

	postUserAppVersion(req, res) {
		const { app } = req.body;

		const currentVersion = constants.VERSION;
		const username = req.user.cn;

		// search for app version
		privateMethods.findAppVersionByUser(username, app)
		.then((result) => { 

			// if data found, send data back and update it to newest version
			if (result) {

				// new users who are still in the same version
				if (result.dataValues.version === 'NEWUSER_' + currentVersion) {
					res.status(200).send(
						{
							newUser: true,
							currentVersion: true,
							message: 'New user app version updated'
						}
					)
				}

				// any user with outdated version
				else if (result.dataValues.version !== constants.VERSION) {

					privateMethods.updateAppVersion(username, app, currentVersion)
					.then((update) => { 

						// the app version was found and updated
						if (update[0] === 1) {
							res.status(200).send(
								{
									newUser: false,
									currentVersion: false, // version had to be updated
									message: 'user app version updated'
								}
							);
						}

						// failed to update
						else {
							res.status(400).send(
								{ 
									message: 'failed to update'
								}
							)
						}
					})
					.catch((err) => {
						logger.error(err);
						res.status(400).send(err);
					});
				}

				// up to date
				else {

					res.status(200).send({
						newUser: false,
						currentVersion: true,
						message: 'App version is up to date'
					});
				}
			}
			// entirely new user
			else {

 				// app version was not found, add new row
				privateMethods.addNewAppVersion(username, app, 'NEWUSER_' + currentVersion)
				.then(() => { 
					res.status(200).send({
						newUser: true,
						currentVersion: false,
						message: 'new user app version added'
					});
				}).catch(err => {
					logger.error(err);
					res.status(400).send({
						message: 'failed to add new user app'
					});
				});
			}
		})
		.catch((err) => {
			logger.error(err);
			res.status(400).send(err);
		})
	}
};
