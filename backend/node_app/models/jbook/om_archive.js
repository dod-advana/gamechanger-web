'use strict';
module.exports = (sequelize, DataTypes) => {
	return sequelize.define(
		'om_archive',
		{
			id: {
				type: DataTypes.INTEGER,
				autoIncrement: true,
				primaryKey: true,
			},
			account: {
				type: DataTypes.TEXT,
			},
			account_title: {
				type: DataTypes.TEXT,
			},
			organization: {
				type: DataTypes.TEXT,
			},
			budget_activity: {
				type: DataTypes.TEXT,
			},
			budget_activity_title: {
				type: DataTypes.TEXT,
			},
			ag_bsa: {
				type: DataTypes.TEXT,
			},
			ag_budget_subactivity_title: {
				type: DataTypes.TEXT,
			},
			line_number: {
				type: DataTypes.TEXT,
			},
			sag_bli: {
				type: DataTypes.TEXT,
			},
			sag_budget_line_item_title: {
				type: DataTypes.TEXT,
			},
			include_in_toa: {
				type: DataTypes.TEXT,
			},
			fy_2020_actual: {
				type: DataTypes.TEXT,
			},
			fy_2021_actual: {
				type: DataTypes.TEXT,
			},
			fy_2021_request: {
				type: DataTypes.TEXT,
			},
			classification: {
				type: DataTypes.TEXT,
			},
			budget_year: {
				type: DataTypes.TEXT,
			},

			sag_budget_line_item_title_search: {
				type: DataTypes.TSVECTOR,
			},
		},
		{
			freezeTableName: true,
			timestamps: false,
			tableName: 'om_arxv',
		}
	);
};
