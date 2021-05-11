'use strict';
const tablename = 'gc_users'

module.exports = {
  up: (queryInterface, Sequelize) => {
		return queryInterface.sequelize.transaction(function () {
			return Promise.all([
				queryInterface.addColumn(tablename, 'notifications', Sequelize.JSONB),
			]);
		});
  },

  down: (queryInterface, Sequelize) => {
		return queryInterface.sequelize.transaction(function () {
			return Promise.all([
				queryInterface.removeColumn(tablename, 'notifications', Sequelize.JSONB),
			]);
		});
  }
};
