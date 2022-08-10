'use strict';

const tableName = 'feedback';

module.exports = {
	async up(queryInterface, Sequelize) {
		return queryInterface.addColumn(tableName, 'createdAt', {
			allowNull: false,
			type: Sequelize.DATE,
			defaultValue: Sequelize.fn('NOW'),
		});
	},

	async down(queryInterface, Sequelize) {
		return queryInterface.removeColumn(tableName, 'createdAt', {
			allowNull: false,
			type: Sequelize.DATE,
			defaultValue: Sequelize.fn('NOW'),
		});
	},
};
