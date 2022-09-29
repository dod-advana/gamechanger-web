'use strict';
module.exports = {
	up: (queryInterface, Sequelize) => {
		return queryInterface.createTable('om', {
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.INTEGER,
			},
			account: {
				type: Sequelize.TEXT,
			},
			account_title: {
				type: Sequelize.TEXT,
			},
			organization: {
				type: Sequelize.TEXT,
			},
			budget_activity: {
				type: Sequelize.TEXT,
			},
			budget_activity_title: {
				type: Sequelize.TEXT,
			},
			ag_bsa: {
				type: Sequelize.TEXT,
			},
			ag_budget_subactivity_title: {
				type: Sequelize.TEXT,
			},
			line_number: {
				type: Sequelize.TEXT,
			},
			sag_bli: {
				type: Sequelize.TEXT,
			},
			sag_budget_line_item_title: {
				type: Sequelize.TEXT,
			},
			include_in_toa: {
				type: Sequelize.TEXT,
			},
			fy_2020_actual: {
				type: Sequelize.TEXT,
			},
			fy_2021_actual: {
				type: Sequelize.TEXT,
			},
			fy_2021_request: {
				type: Sequelize.TEXT,
			},
			classification: {
				type: Sequelize.TEXT,
			},
		});
	},
	down: (queryInterface, _Sequelize) => {
		return queryInterface.dropTable('om');
	},
};
