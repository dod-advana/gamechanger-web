'use strict';
const tablename = 'responsibilities';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(function () {
			return Promise.all([
        queryInterface.addColumn(tablename, 'status', {
          type : Sequelize.TEXT,
          defaultValue : 'active'
        }),
			]);
		});
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(function () {
			return Promise.all([
        queryInterface.removeColumn(tablename, 'status'),
			]);
		});
  }
};
