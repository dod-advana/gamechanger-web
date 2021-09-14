'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(function () {
			return Promise.all([
				queryInterface.addColumn('api_keys', 'description', Sequelize.STRING),
			]);
		});
  },

  down: async (queryInterface, Sequelize) => {
		return queryInterface.sequelize.transaction(function () {
			return Promise.all([
				queryInterface.removeColumn('api_keys', 'description', Sequelize.STRING)
			]);
		});
  }
};

