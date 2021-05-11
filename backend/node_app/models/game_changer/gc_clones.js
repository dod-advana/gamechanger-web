'use strict';
module.exports = (sequelize, DataTypes) => {
	const GC_CLONES = sequelize.define('gc_clones',
		{
			id: {
				type: DataTypes.INTEGER,
				autoIncrement: true,
				primaryKey: true,
			},
			clone_name: {
				type: DataTypes.TEXT
			},
			is_live: {
				type: DataTypes.BOOLEAN
			},
			clone_data: {
				type: DataTypes.JSONB
			}
		},
		{
			freezeTableName: true,
			tableName: 'gc_clones',
			timestamps: false
		}
	);
	return GC_CLONES;
};