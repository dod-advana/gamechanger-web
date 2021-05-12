'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
		return queryInterface.sequelize.transaction(() => {
			return Promise.all([
        queryInterface.addColumn('gc_users', 'api_requests', Sequelize.INTEGER)
			]);
		});
  },

  down: async (queryInterface, Sequelize) => {
		return queryInterface.sequelize.transaction(() => {
			return Promise.all([
        queryInterface.removeColumn('gc_users', 'api_requests', Sequelize.INTEGER)
			]);
		});
  }
};
