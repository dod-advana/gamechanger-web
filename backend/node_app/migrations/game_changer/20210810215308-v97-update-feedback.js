'use strict';

const tablename = 'feedback';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(function () {
			return Promise.all([
        queryInterface.changeColumn(tablename, 'value_5', {
					type: Sequelize.TEXT
				})
			]);
		});
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(function () {
			return Promise.all([
        queryInterface.changeColumn(tablename, 'value_5', {
					type: Sequelize.STRING
				})
			]);
		});
  }
};