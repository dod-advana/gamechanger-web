'use strict';

const tablename = 'feedback';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(function () {
			return Promise.all([
				queryInterface.removeColumn(tablename, 'value_5'),
        queryInterface.removeColumn(tablename, 'value_6'),
        queryInterface.addColumn(tablename, 'value_5', Sequelize.TEXT),
        queryInterface.addColumn(tablename, 'value_6', Sequelize.TEXT)
			]);
		});
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(function () {
			return Promise.all([
        queryInterface.removeColumn(tablename, 'value_5'),
        queryInterface.removeColumn(tablename, 'value_6'),
        queryInterface.addColumn(tablename, 'value_5', Sequelize.STRING),
        queryInterface.addColumn(tablename, 'value_6', Sequelize.STRING)
			]);
		});
  }
};
