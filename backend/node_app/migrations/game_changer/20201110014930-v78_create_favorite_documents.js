'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		return queryInterface.createTable('favorite_documents', {
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
			filename: {
				type: Sequelize.STRING,
				allowNull: false
			},
			favorite_name: {
				type: Sequelize.STRING,
				allowNull: true
			},
			favorite_summary: {
				type: Sequelize.STRING,
				allowNull: true
			},
			search_text: {
				type: Sequelize.STRING,
				allowNull: true
			},
			is_clone: {
				type: Sequelize.BOOLEAN,
				allowNull: false
			},
			clone_index: {
				type: Sequelize.STRING,
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
		return queryInterface.dropTable('favorite_documents');
	}
};
