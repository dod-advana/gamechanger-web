'use strict';
module.exports = {
	up: (queryInterface, Sequelize) => {
		return queryInterface.createTable('keyword', {
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.INTEGER
			},
			name: {
				type: Sequelize.TEXT
			},
			aliases: {
				type: Sequelize.ARRAY(Sequelize.TEXT)
			}
		});
	},
	down: (queryInterface, Sequelize) => {
		return queryInterface.dropTable('keyword');
	}
};