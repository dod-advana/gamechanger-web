'use strict';
module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.createTable('compare_feedback', {
			id: {
				allowNull: false,
				type: Sequelize.INTEGER,
				autoIncrement: true,
				primaryKey: true
			},
			searchedParagraph: {
				allowNull: false,
				type: Sequelize.TEXT,
			},
			matchedParagraphId: {
				allowNull: false,
				type: Sequelize.TEXT,
			},
			docId: {
				allowNull: false,
				type: Sequelize.TEXT,
			},
			positiveFeedback: {
				allowNull: false,
				type: Sequelize.BOOLEAN,
			},
			createdAt: Sequelize.DATE,
			updatedAt: Sequelize.DATE
		});
	},
	down: async (queryInterface, Sequelize) => {
		await queryInterface.dropTable('compare_feedback');
	}
};
