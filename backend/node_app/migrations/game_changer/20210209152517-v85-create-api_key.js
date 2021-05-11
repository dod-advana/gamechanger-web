'use strict';
const tablename = 'api_keys';
module.exports = {
	up: (queryInterface, Sequelize) => {
		return queryInterface.createTable(tablename, {
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.INTEGER
			},
			apiKey: {
				type: Sequelize.TEXT,
			},
			username: {
				type: Sequelize.TEXT,
			},
			active: {
				type: Sequelize.BOOLEAN
			},
			createdAt: {
				allowNull: false,
				type: Sequelize.DATE
			},
			updatedAt: {
				allowNull: false,
				type: Sequelize.DATE,
				defaultValue: Sequelize.fn('NOW')
			}
		});
	},
	down: (queryInterface, Sequelize) => {
		return queryInterface.dropTable(tablename);
	}
};
