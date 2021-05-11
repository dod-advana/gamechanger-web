'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(function () {
			return Promise.all([
				queryInterface.addColumn('gc_history', 'tiny_url', Sequelize.STRING)
			]);
		});
  },

  down: (queryInterface, Sequelize) => {
		return queryInterface.sequelize.transaction(function () {
			return Promise.all([
				queryInterface.removeColumn('gc_history', 'tiny_url', Sequelize.STRING)
			]);
		});
  }
};
