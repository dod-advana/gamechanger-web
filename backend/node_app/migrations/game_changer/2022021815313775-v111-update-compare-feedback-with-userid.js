'use strict';
const tablename = 'compare_feedback';

module.exports = {
	up: (queryInterface, Sequelize) => {
		return queryInterface.sequelize.transaction(function () {
			return Promise.all([
				queryInterface.addColumn(tablename, 'userId', Sequelize.TEXT),
			]);
			
		});
	},

	down: (queryInterface, Sequelize) => {
		return queryInterface.sequelize.transaction(function () {
			return Promise.all([
				queryInterface.removeColumn(tablename, 'userId'),
			]);
		});
	}
};