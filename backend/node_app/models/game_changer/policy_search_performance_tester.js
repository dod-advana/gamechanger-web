'use strict';

const { Sequelize } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
	const POLICY_SEARCH_PERFORMANCE_TESTER = sequelize.define(
		'policy_search_performance_tests',
		{
			test_id: {
				type: DataTypes.INTEGER,
				autoIncrement: true,
				primaryKey: true,
			},
			gc_version: {
				type: DataTypes.VARCHAR(25),
				allowNull: false,
			},
			total_average: {
				type: DataTypes.INTEGER,
			},
			total_number_of_documents_not_found: {
				type: DataTypes.INTEGER,
			},
			source_results: {
				type: DataTypes.JSONB,
			},
			timestamp: {
				type: DataTypes.DATE,
				allowNull: false,
				defaultValue: Sequelize.fn('NOW'),
			},
		},
		{
			freezeTableName: true,
			tableName: 'policy_search_performance_tests',
			timestamps: true,
		}
	);
	return POLICY_SEARCH_PERFORMANCE_TESTER;
};
