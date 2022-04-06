'use strict';
const tablename = 'review';

module.exports = {
	up: (queryInterface, Sequelize) => {
		return queryInterface.describeTable(tablename).then((tableDefinition) => {
			const queries = [];

			if (!tableDefinition['budget_activity'])
				queries.push(queryInterface.addColumn(tablename, 'budget_activity', Sequelize.TEXT));

			return queryInterface.sequelize.transaction(function () {
				Promise.all(queries);
			});
		});
	},

	down: (queryInterface, Sequelize) => {
		return queryInterface.sequelize.transaction(function () {
			Promise.all([queryInterface.removeColumn(tablename, 'budget_activity', Sequelize.TEXT)]);
		});
	},
};
