'use strict';
module.exports = (sequelize, DataTypes) => {
	return sequelize.define('contracts',
		{
			id: {
				type: DataTypes.INTEGER,
				autoIncrement: true,
				primaryKey: true,
			},
			bli: {
				type: DataTypes.TEXT,
			},
			proj_number: {
				type: DataTypes.TEXT
			},
			appn_num: {
				type: DataTypes.TEXT
			},
			ba_num: {
				type: DataTypes.TEXT
			},
			budgetyear: {
				type: DataTypes.TEXT
			},
			budgetcycle: {
				type: DataTypes.TEXT,
			},
			organization: {
				type: DataTypes.TEXT,
			},
			ce_cat_name: {
				type: DataTypes.TEXT,
			},
			ce_cat_type: {
				type: DataTypes.TEXT,
			},
			ce_name: {
				type: DataTypes.TEXT,
			},
            ce_item_name: {
				type: DataTypes.TEXT,
			},
            vendor: {
				type: DataTypes.TEXT,
			},
			vendor_location: {
				type: DataTypes.TEXT,
			},
			award_date: {
				type: DataTypes.TEXT,
			},
		}, {
			freezeTableName: true,
			timestamps: false,
			tableName: 'contracts'
		}
	);
};
