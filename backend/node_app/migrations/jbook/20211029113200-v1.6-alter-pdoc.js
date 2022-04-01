'use strict';

const tablename = 'pdoc';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		return queryInterface.sequelize.transaction(function () {
			Promise.all([
				queryInterface.addColumn(tablename, 'P40-14_Description', Sequelize.TEXT),
				queryInterface.addColumn(tablename, 'P40-15_Justification', Sequelize.TEXT),
				queryInterface.addColumn(tablename, 'P40-14_Description_Search', Sequelize.TSVECTOR),
				queryInterface.addColumn(tablename, 'P40-15_Justification_Search', Sequelize.TSVECTOR),
			]);
		});
	},

	down: async (queryInterface, Sequelize) => {
		return queryInterface.sequelize.transaction(function () {
			return Promise.all([
				queryInterface.removeColumn(tablename, 'P40-14_Description', Sequelize.TEXT),
				queryInterface.removeColumn(tablename, 'P40-15_Justification', Sequelize.TEXT),
				queryInterface.removeColumn(tablename, 'P40-14_Description_Search', Sequelize.TSVECTOR),
				queryInterface.removeColumn(tablename, 'P40-15_Justification_Search', Sequelize.TSVECTOR),
			]);
		});
	},
};
