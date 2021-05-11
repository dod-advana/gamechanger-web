'use strict';
const tablename = 'responsibilities';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable(tablename, {
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.INTEGER
			},
			filename: {
				type: Sequelize.TEXT
			},
			responsibilityLevel1: {
				type: Sequelize.TEXT
			},
      responsibilityLevel2: {
				type: Sequelize.TEXT
			},
      responsibilityLevel3: {
				type: Sequelize.TEXT
			},
      primaryEntity: {
				type: Sequelize.TEXT
			},
      entitiesFound: {
				type: Sequelize.TEXT
			},
      references: {
				type: Sequelize.TEXT
			},
		});
  },

  down: async (queryInterface, Sequelize) => {
		return queryInterface.dropTable(tablename);
  }
};
