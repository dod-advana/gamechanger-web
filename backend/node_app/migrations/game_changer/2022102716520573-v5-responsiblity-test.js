'use strict';
const tablename = 'responsibilities_test';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		return queryInterface.createTable(tablename, {
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.INTEGER,
			},
			filename: {
				type: Sequelize.TEXT,
			},
			documentTitle: {
				type: Sequelize.TEXT,
			},
			organizationPersonnelNumbering: {
				type: Sequelize.TEXT,
			},
			organizationPersonnelText: {
				type: Sequelize.TEXT,
			},
			organizationPersonnelEntities: {
				type: Sequelize.TEXT,
			},
			responsibilityNumbering: {
				type: Sequelize.TEXT,
			},
			responsibilityText: {
				type: Sequelize.TEXT,
			},
			responsibilityEntities: {
				type: Sequelize.TEXT,
			},
			status: {
				type: Sequelize.TEXT,
				defaultValue: 'active',
			},
		});
	},

	down: async (queryInterface, _Sequelize) => {
		return queryInterface.dropTable(tablename);
	},
};
