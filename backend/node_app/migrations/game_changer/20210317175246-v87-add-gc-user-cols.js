'use strict';
const tablename = 'gc_users';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(function () {
			return Promise.all([
				queryInterface.addColumn(tablename, 'user_info', Sequelize.JSONB),
        queryInterface.addColumn(tablename, 'submitted_info', Sequelize.BOOLEAN),
			]);
		});

  },

  down: (queryInterface, Sequelize) => {
		return queryInterface.sequelize.transaction(function () {
			return Promise.all([
				queryInterface.removeColumn(tablename, 'user_info', Sequelize.JSONB),
        queryInterface.removeColumn(tablename, 'submitted_info', Sequelize.BOOLEAN),
			]);
		});
  }
};
