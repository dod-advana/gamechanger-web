'use strict';
const tablename = 'review';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		return queryInterface.sequelize.transaction(function () {
			Promise.all([
				queryInterface.addColumn(tablename, 'doc_id', Sequelize.TEXT)
			]);
		});
	},

	down: async (queryInterface, Sequelize) => {
		return queryInterface.sequelize.transaction(function () {
			return Promise.all([
				queryInterface.removeColumn(tablename, 'doc_id', Sequelize.TEXT)
			]);
		});
	}
};
