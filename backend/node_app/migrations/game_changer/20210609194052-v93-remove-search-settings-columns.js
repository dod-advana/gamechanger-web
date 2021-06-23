'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(function () {
			return Promise.all([
				queryInterface.removeColumn('gc_users', 'search_settings', Sequelize.JSONB),
			]);
		});
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(function () {
        return Promise.all([
            ueryInterface.addColumn('gc_users', 'search_settings', Sequelize.JSONB),
        ]);
    });
  }
};
