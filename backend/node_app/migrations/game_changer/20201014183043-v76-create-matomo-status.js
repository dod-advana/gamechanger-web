'use strict';
module.exports = {
	up: (queryInterface, Sequelize) => {
		return queryInterface.createTable('matomo_status', {
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.INTEGER
			},
			userID: {
				type: Sequelize.STRING
			},
			tracking: {
				type: Sequelize.BOOLEAN
			}
		});
	},
	down: (queryInterface, Sequelize) => {
		return queryInterface.dropTable('matomo_status');
	}
};