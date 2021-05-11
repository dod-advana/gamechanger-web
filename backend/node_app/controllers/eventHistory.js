const eventHistory = require('../models').eventHistory;
const logger = require('../lib/logger');

const actions = {
	create: 'create',
	update: 'update',
	delete: 'delete',
	destroy: 'delete',
};

// sequelize.Model.prototype.getTableName returns String|Object
// https://sequelize.readthedocs.io/en/v3/api/model/#gettablenameoptions-stringobject
function getTableName(instance) {
	let tableName = instance.getTableName();
	if (typeof tableName === 'string') {
		return tableName;
	} else {
		return tableName.tableName;
	}
}

function create(data) {
	return new Promise(function (resolve, reject) {
		let { userCn, table, objectId, action, field, oldValue, newValue, } = data;

		eventHistory.create({
			userCn,
			table,
			objectId,
			action,
			field,
			oldValue,
			newValue,
		}).then(() => {
			resolve();
		}).catch(e => {
			logger.error(e);
			reject(e);
		});
	});
}

module.exports = {
	actions,
	getTableName,
	create,
};
