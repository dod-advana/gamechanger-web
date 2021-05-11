'use strict';
module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.createTable('gc_trending_blacklist', {
			id: {
				allowNull: false,
				type: Sequelize.INTEGER,
				autoIncrement: true,
				primaryKey: true
			},
			search_text: {
				allowNull: false,
				type: Sequelize.TEXT,
				field: 'search_text'
			},
			added_by: {
                allowNull: false,
				type: Sequelize.TEXT,
				field: 'added_by'
			},
			createdAt: {
				allowNull: false,
				type: Sequelize.DATE
			},
			updatedAt: {
				allowNull: false,
				type: Sequelize.DATE
			}
          }, {
			timestamps: true
		});
	},
	down: async (queryInterface, Sequelize) => {
		await queryInterface.dropTable('gc_assists');
	}
};
