'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(function () {
			return Promise.all([
				queryInterface.addColumn('gc_history', 'cached_result', Sequelize.BOOLEAN),
				queryInterface.addColumn('gc_history', 'org_filters', Sequelize.JSONB),
				queryInterface.addColumn('gc_history', 'is_tutorial_search', Sequelize.BOOLEAN)
			]);
		});
  },

  down: (queryInterface, Sequelize) => {
		return queryInterface.sequelize.transaction(function () {
			return Promise.all([
				queryInterface.removeColumn('gc_history', 'cached_result', Sequelize.BOOLEAN),
				queryInterface.removeColumn('gc_history', 'org_filters', Sequelize.JSONB),
				queryInterface.removeColumn('gc_history', 'is_tutorial_search', Sequelize.BOOLEAN)
			]);
		});
  }
};