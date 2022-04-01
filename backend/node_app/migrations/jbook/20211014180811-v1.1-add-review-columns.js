'use strict';
const tablename = 'review';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		return queryInterface.sequelize.transaction(function () {
			Promise.all([
				queryInterface.addColumn(tablename, 'rev_stp', Sequelize.TEXT),
				queryInterface.addColumn(tablename, 'rev_trans_agree', Sequelize.TEXT),
			]);
		});
	},

	down: async (queryInterface, Sequelize) => {
		return queryInterface.sequelize.transaction(function () {
			return Promise.all([
				queryInterface.removeColumn(tablename, 'rev_stp', Sequelize.TEXT),
				queryInterface.removeColumn(tablename, 'rev_trans_agree', Sequelize.TEXT),
			]);
		});
	},
};
