'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(function () {
			return Promise.all([
				queryInterface.addColumn('favorite_documents', 'new_user_id', Sequelize.STRING),
        queryInterface.addColumn('favorite_searches', 'new_user_id', Sequelize.STRING),
        queryInterface.addColumn('favorite_topics', 'new_user_id', Sequelize.STRING),
        queryInterface.addColumn('export_history', 'new_user_id', Sequelize.STRING),
        queryInterface.addColumn('gc_history', 'new_user_id', Sequelize.STRING),
			]);
		});
  },

  down: async (queryInterface, Sequelize) => {
		return queryInterface.sequelize.transaction(function () {
			return Promise.all([
				queryInterface.removeColumn('favorite_documents', 'new_user_id', Sequelize.STRING),
        queryInterface.removeColumn('favorite_searches', 'new_user_id', Sequelize.STRING),
        queryInterface.removeColumn('favorite_topics', 'new_user_id', Sequelize.STRING),
        queryInterface.removeColumn('export_history', 'new_user_id', Sequelize.STRING),
        queryInterface.removeColumn('gc_history', 'new_user_id', Sequelize.STRING),
			]);
		});
  }
};

