'use strict';
const tablename = 'gc_users';

module.exports = {
	up: (queryInterface, Sequelize) => {
		return queryInterface.describeTable(tablename).then((tableDefinition) => {
			const queries = [];

			if (!tableDefinition['cn']) queries.push(queryInterface.addColumn(tablename, 'cn', Sequelize.TEXT));
			if (!tableDefinition['is_beta'])
				queries.push(queryInterface.addColumn(tablename, 'is_beta', Sequelize.BOOLEAN));
			if (!tableDefinition['is_internal'])
				queries.push(queryInterface.addColumn(tablename, 'is_internal', Sequelize.BOOLEAN));
			if (!tableDefinition['is_admin'])
				queries.push(queryInterface.addColumn(tablename, 'is_admin', Sequelize.BOOLEAN));

			return queryInterface.sequelize.transaction(function () {
				Promise.all(queries);
			});
		});
	},

	down: (queryInterface, Sequelize) => {
		return queryInterface.sequelize.transaction(function () {
			Promise.all([
				queryInterface.removeColumn(tablename, 'cn', Sequelize.TEXT),
				queryInterface.removeColumn(tablename, 'is_beta', Sequelize.BOOLEAN),
				queryInterface.removeColumn(tablename, 'is_internal', Sequelize.BOOLEAN),
				queryInterface.removeColumn(tablename, 'is_admin', Sequelize.BOOLEAN),
			]);
		});
	},
};
