'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		return queryInterface.sequelize.transaction(function () {
			return Promise.all([
				queryInterface.addColumn('gc_users', 'is_beta', Sequelize.BOOLEAN),
				queryInterface.addColumn('gc_users', 'search_settings', Sequelize.JSONB)
			]);
		});
  },

	down: async (queryInterface, Sequelize) => {
		return queryInterface.sequelize.transaction(function () {
			return Promise.all([
				queryInterface.removeColumn('gc_users', 'is_beta', Sequelize.BOOLEAN),
				queryInterface.removeColumn('gc_users', 'search_settings', Sequelize.JSONB),
			]);
		});
  }
};
