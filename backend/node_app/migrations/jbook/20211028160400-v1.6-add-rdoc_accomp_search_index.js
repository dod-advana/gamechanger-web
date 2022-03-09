'use strict';
const tablename = 'rdoc_accomp';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		return queryInterface.sequelize.transaction(function () {
			Promise.all([
				queryInterface.addColumn(tablename, 'search', Sequelize.TSVECTOR),
			]);
		});
	},

	down: async (queryInterface, Sequelize) => {
		return queryInterface.sequelize.transaction(function () {
			return Promise.all([
				queryInterface.removeColumn(tablename, 'search', Sequelize.TSVECTOR),
			]);
		});
	}
};

