'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		return queryInterface.createTable('favorite_searches', {
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.INTEGER
			},
			user_id: {
				type: Sequelize.STRING,
				allowNull: false,
			},
			search_name: {
				type: Sequelize.STRING,
				allowNull: false
			},
			search_summary: {
				type: Sequelize.STRING,
				allowNull: false
			},
			search_text: {
				type: Sequelize.STRING,
				allowNull: false
			},
			tiny_url: {
				type: Sequelize.STRING,
				allowNull: false
			},
			document_count: {
				type: Sequelize.INTEGER,
				allowNull: true
			},
			createdAt: {
				allowNull: false,
				type: Sequelize.DATE,
				defaultValue: Sequelize.fn('NOW')
			},
			updatedAt: {
				allowNull: false,
				type: Sequelize.DATE,
				defaultValue: Sequelize.fn('NOW')
			}
		});
	},

	down: async (queryInterface, Sequelize) => {
		return queryInterface.dropTable('favorite_searches');
	}
};
