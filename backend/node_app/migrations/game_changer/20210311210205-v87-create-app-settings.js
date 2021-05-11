'use strict';
const tablename = 'app_settings';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable(tablename, {
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.INTEGER
			},
			key: {
				type: Sequelize.STRING 
			},
			value: {
				type: Sequelize.STRING
			}
		}).then(() => (queryInterface.bulkInsert(tablename, [{key : 'combined_search', value: 'true'}])));
  },

  down: async (queryInterface, Sequelize) => {
		return queryInterface.dropTable(tablename);
  }
};
