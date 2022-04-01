'use strict';
const tablename = 'keyword_assoc';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		return queryInterface.sequelize.transaction(function () {
			Promise.all([queryInterface.addColumn(tablename, 'accomp_id', Sequelize.INTEGER)]);
		});
	},

	down: async (queryInterface, Sequelize) => {
		return queryInterface.sequelize.transaction(function () {
			return Promise.all([queryInterface.removeColumn(tablename, 'accomp_id', Sequelize.INTEGER)]);
		});
	},
};
