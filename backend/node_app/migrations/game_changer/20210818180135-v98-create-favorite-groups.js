'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		return queryInterface.createTable('favorite_groups',
		{
			id: {
				type: Sequelize.INTEGER,
				autoIncrement: true,
				primaryKey: true,
                allowNull: false
			},
			user_id: {
				type: Sequelize.STRING,
				allowNull: false
			},
			group_type: {
				type: Sequelize.STRING,
				allowNull: true
			},
			group_name: {
				type: Sequelize.STRING,
				allowNull: true
			},
			group_description: {
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

	down: async (queryInterface, Sequelize) => {
		return queryInterface.dropTable('favorite_groups');
	}
};
