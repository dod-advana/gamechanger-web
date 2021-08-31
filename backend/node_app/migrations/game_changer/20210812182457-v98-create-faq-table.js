'use strict';
module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.createTable('faq', {
			id: {
				allowNull: false,
				type: Sequelize.INTEGER,
				autoIncrement: true,
				primaryKey: true
			},
			question: {
				allowNull: false,
				type: Sequelize.TEXT,
			},
			answer: {
				allowNull: false,
				type: Sequelize.TEXT,
			},
			category: {
				allowNull: false,
				type: Sequelize.TEXT
			},
			createdAt: Sequelize.DATE,
			updatedAt: Sequelize.DATE
		});
	},
	down: async (queryInterface, Sequelize) => {
		await queryInterface.dropTable('faq');
	}
};
