'use strict';

module.exports = (sequelize, DataTypes) => {
	const LINE_ITEM_DETAILS = sequelize.define('line_item_details',
		{
            filename: {
                type: DataTypes.TEXT,
                primaryKey: true,
            },
            prod_or_svc: {
                type: DataTypes.TEXT,
            },
            prod_or_svc_desc: {
                type: DataTypes.TEXT,
            },
            li_base: {
                type: DataTypes.TEXT,
            },
            li_type: {
                type: DataTypes.TEXT,
            },
            obligated_amount: {
                type: DataTypes.TEXT,
            },
            obligated_amount_cin: {
                type: DataTypes.TEXT,
            },
            row_id: {
                type: DataTypes.TEXT,
            },
            est_qty_value: {
                type: DataTypes.TEXT,
            },
		},{
            freezeTableName: true,
			timestamps: false,
            schema: 'pds_parsed',
            tableName: 'line_item_details'
		}
	);
	return LINE_ITEM_DETAILS;
};
