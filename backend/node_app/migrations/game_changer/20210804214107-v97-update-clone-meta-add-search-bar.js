'use strict';
const tablename = 'clone_meta';

module.exports = {
  up: (queryInterface, Sequelize) => {
		return queryInterface.sequelize.transaction(function () {
			return Promise.all([
				queryInterface.addColumn(tablename, 'search_bar_module', Sequelize.STRING),
			]);
		});
  },

  down: (queryInterface, Sequelize) => {
		return queryInterface.sequelize.transaction(function () {
			return Promise.all([
				queryInterface.removeColumn(tablename, 'search_bar_module', Sequelize.STRING),
			]);
		});
  }
};