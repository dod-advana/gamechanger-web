'use strict';
const tablename = 'favorite_searches';

module.exports = {
  up: (queryInterface, Sequelize) => {
		return queryInterface.sequelize.transaction(function () {
			return Promise.all([
				queryInterface.addColumn(tablename, 'updated_results', Sequelize.BOOLEAN),
				queryInterface.addColumn(tablename, 'run_by_cache', Sequelize.BOOLEAN),
			]);
		});
  },

  down: (queryInterface, Sequelize) => {
		return queryInterface.sequelize.transaction(function () {
			return Promise.all([
				queryInterface.removeColumn(tablename, 'updated_results', Sequelize.BOOLEAN),
				queryInterface.removeColumn(tablename, 'run_by_cache', Sequelize.BOOLEAN),
			]);
		});
  }
};
