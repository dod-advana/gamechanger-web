'use strict';
const tablename = 'favorite_topics';
module.exports = {
	up: (queryInterface, Sequelize) => {
		return queryInterface.createTable(tablename, {
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.INTEGER
			},
			user_id: {
				type: Sequelize.STRING,
				allowNull: false
			},
			topic_name: {
				type: Sequelize.STRING,
				allowNull: false
			},
			topic_summary: {
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
			createdAt: Sequelize.DATE,
			updatedAt: Sequelize.DATE,
		});
	},
	down: (queryInterface, Sequelize) => {
		return queryInterface.dropTable(tablename);
	}
};
