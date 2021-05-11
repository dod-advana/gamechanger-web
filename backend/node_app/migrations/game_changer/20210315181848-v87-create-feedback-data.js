'use strict';
const tablename = 'feedback';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable(tablename, {
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.INTEGER
			},
			event_name: {
				allowNull: false,
				type: Sequelize.STRING
			},
			user_id: {
				allowNull: false, 
				type: Sequelize.STRING
			},
			createdAt: {
				allowNull: false,
				type: Sequelize.DATE
			},
			value_1: {
				type: Sequelize.STRING
			},
			value_2: {
				type: Sequelize.STRING
			},
			value_3: {
				type: Sequelize.STRING
			},
			value_4: {
				type: Sequelize.STRING
			},
			value_5: {
				type: Sequelize.STRING
			},
			value_6: {
				type: Sequelize.STRING
			},
			value_7: {
				type: Sequelize.STRING
			},
		});
  },

  down: async (queryInterface, Sequelize) => {
		return queryInterface.dropTable(tablename);
  }
};
