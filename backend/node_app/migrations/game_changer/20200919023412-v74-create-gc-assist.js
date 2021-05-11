'use strict';
module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.createTable('gc_assists', {
			id: {
				allowNull: false,
				type: Sequelize.INTEGER,
				autoIncrement: true,
				primaryKey: true,
			},
			user_id: {
				allowNull: false,
				type: Sequelize.TEXT,
				field: 'user_id'
			},
			user_score: {
				type: Sequelize.FLOAT,
				field: 'user_score'
			},
			is_sme: {
				type: Sequelize.BOOLEAN,
				field: 'is_sme'
			},
			document_id: {
				allowNull: false,
				type: Sequelize.TEXT,
				field: 'document_id'
			},
			paragraph_id: {
				allowNull: false,
				type: Sequelize.INTEGER,
				field: 'paragraph_id'
			},
			tokens_assumed: {
				allowNull: false,
				type: Sequelize.TEXT,
				field: 'tokens_assumed'
			},
			entity_tag: {
				allowNull: false,
				type: Sequelize.TEXT,
				field: 'entity_tag'
			},
			confidence_score: {
				type: Sequelize.FLOAT,
				field: 'confidence_score'
			},
			tagged_correctly: {
				allowNull: false,
				type: Sequelize.BOOLEAN,
				field: 'tagged_correctly'
			},
			incorrect_reason: {
				allowNull: false,
				type: Sequelize.INTEGER,
				field: 'incorrect_reason'
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
	down: async (queryInterface, Sequelize) => {
		await queryInterface.dropTable('gc_assists');
	}
};
