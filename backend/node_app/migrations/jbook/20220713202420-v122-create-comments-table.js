'use strict';
module.exports = {
	up: (queryInterface, Sequelize) => {
		return queryInterface.createTable('comments', {
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.INTEGER,
			},
			docID: {
				allowNull: false,
				type: Sequelize.TEXT,
			},
			portfolioName: {
				allowNull: false,
				type: Sequelize.TEXT,
			},
			message: {
				allowNull: false,
				type: Sequelize.TEXT,
			},
			author: {
				type: Sequelize.TEXT,
			},
			createdAt: {
				type: Sequelize.DATE,
				defaultValue: Sequelize.fn('NOW'),
				allowNull: false,
			},
			updatedAt: {
				type: Sequelize.DATE,
				defaultValue: Sequelize.fn('NOW'),
				allowNull: false,
			},
			upvotes: {
				type: Sequelize.ARRAY(Sequelize.TEXT),
			},
			downvotes: {
				type: Sequelize.ARRAY(Sequelize.TEXT),
			},
			deleted: {
				type: Sequelize.BOOLEAN,
				default: false,
			},
		});
	},
	down: (queryInterface, _Sequelize) => {
		return queryInterface.dropTable('comments');
	},
};
