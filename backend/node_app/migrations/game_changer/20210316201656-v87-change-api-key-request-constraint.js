'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
		return queryInterface.sequelize.transaction(() => {
			return Promise.all([
        queryInterface.sequelize.query(
          'ALTER TABLE "api_key_requests" DROP CONSTRAINT "api_key_requests_username_key";'
        ),
        queryInterface.removeIndex('api_key_requests', 'api_key_requests_username_key'),
        queryInterface.addColumn('gc_users', 'api_requests', Sequelize.INTEGER)
			]);
		});
  },

  down: async (queryInterface, Sequelize) => {
		return queryInterface.sequelize.transaction(() => {
			return Promise.all([
        queryInterface.changeColumn('api_key_requests', 'username', { type: Sequelize.TEXT, unique: true }),
        queryInterface.removeColumn('gc_users', 'api_requests', Sequelize.INTEGER)
			]);
		});
  }
};
