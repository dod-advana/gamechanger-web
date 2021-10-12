'use strict';
const tablename = 'crawler_info'
module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(function () {
			return Promise.all([
        queryInterface.renameColumn(tablename, 'display_source_s', 'data_source_s')
			]);
		});
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(function () {
			return Promise.all([
        queryInterface.renameColumn(tablename, 'data_source_s', 'display_source_s')
			]);
		});
  }
};
