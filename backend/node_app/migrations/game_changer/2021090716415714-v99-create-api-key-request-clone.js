'use strict';
module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.createTable('api_key_request_clones', {
			id: {
				allowNull: false,
				type: Sequelize.INTEGER,
				autoIncrement: true,
				primaryKey: true
			},
			apiKeyRequestId: {
				allowNull: false,
				type: Sequelize.INTEGER,
			},
			cloneId: {
				allowNull: false,
				type: Sequelize.INTEGER,
			},
			createdAt: Sequelize.DATE,
			updatedAt: Sequelize.DATE
		});
	},
	down: async (queryInterface, Sequelize) => {
		await queryInterface.dropTable('api_key_request_clones');
	}
};
