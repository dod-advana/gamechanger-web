'use strict';
const tablename = 'users';

module.exports = {
	up: (queryInterface, Sequelize) => {
		return queryInterface.describeTable(tablename).then((tableDefinition) => {
			const queries = [];

			if (tableDefinition['middle_initial'])
				queries.push(queryInterface.removeColumn(tablename, 'middle_initial', Sequelize.TEXT));
			if (!tableDefinition['user_id'])
				queries.push(queryInterface.addColumn(tablename, 'user_id', { type: Sequelize.TEXT, unique: true }));
			if (!tableDefinition['organization'])
				queries.push(queryInterface.addColumn(tablename, 'organization', Sequelize.TEXT));
			if (!tableDefinition['email']) queries.push(queryInterface.addColumn(tablename, 'email', Sequelize.TEXT));

			return queryInterface.sequelize.transaction(function () {
				Promise.all(queries);
			});
		});
	},

	down: (queryInterface, Sequelize) => {
		return queryInterface.sequelize.transaction(function () {
			Promise.all([
				queryInterface.addColumn(tablename, 'middle_initial', Sequelize.TEXT),
				queryInterface.removeColumn(tablename, 'user_id', Sequelize.TEXT),
				queryInterface.removeColumn(tablename, 'organization', Sequelize.TEXT),
				queryInterface.removeColumn(tablename, 'email', Sequelize.TEXT),
			]);
		});
	},
};
