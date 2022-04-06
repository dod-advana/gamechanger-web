'use strict';
module.exports = (sequelize, DataTypes) => {
	return sequelize.define(
		'vendor',
		{
			id: {
				type: DataTypes.INTEGER,
				autoIncrement: true,
				primaryKey: true,
			},
			global_parent_duns_name: {
				type: DataTypes.TEXT,
			},
			vendor_name: {
				type: DataTypes.TEXT,
			},
			piid: {
				type: DataTypes.TEXT,
			},
			pe_num: {
				type: DataTypes.TEXT,
			},
			fiscal_year: {
				type: DataTypes.TEXT,
			},
		},
		{
			freezeTableName: true,
			timestamps: false,
			tableName: 'vendors',
		}
	);
};
