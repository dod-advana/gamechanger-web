'use strict';

const { Sequelize } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
	const FAVORITE_SEARCH = sequelize.define('favorite_searches',
		{
			id: {
				type: DataTypes.INTEGER,
				autoIncrement: true,
				primaryKey: true,
			},
			user_id: {
				type: DataTypes.TEXT,
				allowNull: false
			},
			new_user_id: {
				type: DataTypes.TEXT
			},
			search_name: {
				type: DataTypes.TEXT,
				allowNull: false
			},
			search_summary: {
				type: DataTypes.TEXT,
				allowNull: false
			},
			search_text: {
				type: DataTypes.TEXT,
				allowNull: false
			},
			tiny_url: {
				type: DataTypes.TEXT,
				allowNull: false
			},
			document_count: {
				type: DataTypes.INTEGER,
				allowNull: false
			},
			updated_results: {
				type: DataTypes.BOOLEAN,
			},
			run_by_cache: {
				type: DataTypes.BOOLEAN,
			},
			last_checked: {
				type: DataTypes.DATE,
				allowNull: false,
				defaultValue: Sequelize.fn('NOW'),
			},
		},
		{
			freezeTableName: true,
			tableName: 'favorite_searches',
			timestamps: true
		}
	);
	return FAVORITE_SEARCH;
};
