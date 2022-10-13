'use strict';
const tableName = 'comments';

module.exports = {
	async up(queryInterface, Sequelize) {
		return queryInterface.addColumn(tableName, 'authorId', {
			allowNull: true,
			type: Sequelize.TEXT,
		});
	},

	async down(queryInterface, Sequelize) {
		return queryInterface.removeColumn(tableName, 'authorId', {
			allowNull: true,
			type: Sequelize.TEXT,
		});
	},
};
