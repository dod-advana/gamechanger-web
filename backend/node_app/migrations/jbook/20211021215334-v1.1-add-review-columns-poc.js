'use strict';
const tablename = 'review';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		return queryInterface.sequelize.transaction(function () {
			Promise.all([
				queryInterface.addColumn(tablename, 'secondary_reviewer', Sequelize.TEXT),
        		queryInterface.addColumn(tablename, 'poc_org', Sequelize.TEXT),
        		queryInterface.addColumn(tablename, 'poc_phone_number', Sequelize.TEXT),
			]);
		});
	},

	down: async (queryInterface, Sequelize) => {
		return queryInterface.sequelize.transaction(function () {
			return Promise.all([
				queryInterface.removeColumn(tablename, 'secondary_reviewer', Sequelize.TEXT),
        		queryInterface.removeColumn(tablename, 'poc_org', Sequelize.TEXT),
        		queryInterface.removeColumn(tablename, 'poc_phone_number', Sequelize.TEXT)
			]);
		});
	}
};
