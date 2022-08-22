'use strict';

module.exports = {
	async up(queryInterface, Sequelize) {
		return queryInterface.addColumn(tableName, 'authorId', {
			allowNull: false,
			type: Sequelize.TEXT,
		});
	},

	async down(queryInterface, Sequelize) {
		return queryInterface.removeColumn(tableName, 'authorId', {
			allowNull: false,
			type: Sequelize.TEXT,
		});
	},
};
