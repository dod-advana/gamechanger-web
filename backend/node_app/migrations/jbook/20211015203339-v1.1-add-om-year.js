'use strict';
const tablename = 'om';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		return queryInterface.sequelize.transaction(function () {
			Promise.all([queryInterface.addColumn(tablename, 'budget_year', Sequelize.TEXT)]);
		});
	},

	down: async (queryInterface, Sequelize) => {
		return queryInterface.sequelize.transaction(function () {
			return Promise.all([queryInterface.removeColumn(tablename, 'budget_year', Sequelize.TEXT)]);
		});
	},
};
