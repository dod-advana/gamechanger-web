'use strict';
const tablename = 'clone_meta';

module.exports = {
	up: (queryInterface, Sequelize) => {
		return queryInterface.sequelize.transaction(function () {
			return Promise.all([
				queryInterface.addColumn(tablename, 'main_view_module', Sequelize.STRING),
			]);
		});
	},

	down: (queryInterface, Sequelize) => {
		return queryInterface.sequelize.transaction(function () {
			return Promise.all([
				queryInterface.removeColumn(tablename, 'main_view_module', Sequelize.STRING),
			]);
		});
	}
};
