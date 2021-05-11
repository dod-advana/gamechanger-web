'use strict';
module.exports = (sequelize, DataTypes) => {
	const GC_HISTORY = sequelize.define('haistack_history',
		{
			id: {
				type: DataTypes.INTEGER,
				autoIncrement: true,
				primaryKey: true,
			},
			user_id: {
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
			is_semantic_search: {
				type: DataTypes.BOOLEAN
			}
		},{
			freezeTableName: true,
			tableName: 'haistack_history',
			timestamps: false
		}
	);
	return GC_HISTORY;
};