'use strict';
const tableName = 'review';

module.exports = {
	async up(queryInterface, Sequelize) {
		return queryInterface.addColumn(tableName, 'jbook_ref_id', {
			allowNull: true,
			type: Sequelize.TEXT,
		});
	},

	async down(queryInterface, Sequelize) {
		return queryInterface.removeColumn(tableName, 'jbook_ref_id', {
			allowNull: true,
			type: Sequelize.TEXT,
		});
	},
};
