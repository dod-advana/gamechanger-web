'use strict';
module.exports = (sequelize, DataTypes) => {
	const GC_HISTORY = sequelize.define('gc_history',
		{
			id: {
				type: DataTypes.INTEGER,
				autoIncrement: true,
				primaryKey: true,
			},
			user_id: {
				type: DataTypes.TEXT
			},
			new_user_id: {
				type: DataTypes.TEXT
			},
			clone_name: {
				type: DataTypes.TEXT
			},
			search: {
				type: DataTypes.TEXT
			},
			num_results: {
				type: DataTypes.INTEGER
			},
			had_error: {
				type: DataTypes.BOOLEAN
			},
			run_at: {
				type: DataTypes.DATE
			},
			completion_time: {
				type: DataTypes.DATE
			},
			search_type: {
				type: DataTypes.TEXT
			},
			cached_result: {
				type: DataTypes.BOOLEAN
			},
			is_tutorial_search: {
				type: DataTypes.BOOLEAN
			},
			tiny_url: {
				type: DataTypes.TEXT,
				allowNull: false
			},
			request_body: {
				type: DataTypes.JSONB
			},
			search_version: {
				type: DataTypes.INTEGER
			}
		},{
			freezeTableName: true,
			tableName: 'gc_history',
			timestamps: false
		}
	);
	return GC_HISTORY;
};