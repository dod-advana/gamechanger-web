'use strict';

module.exports = (sequelize, DataTypes) => {
	const ACCOMP = sequelize.define('accomp',
		{
            id: {
                type: DataTypes.TEXT,
                primaryKey: true,
            },
            Program_Element: {
                type: DataTypes.TEXT,
            },
            Project_Number: {
                type: DataTypes.TEXT,
            },
            Accomplishment_Title: {
                type: DataTypes.TEXT,
            },
            Accomplishment_Description: {
                type: DataTypes.TEXT,
            },
            Accomplishment_Description: {
                type: DataTypes.TEXT,
            },
            Procurement_Line_Item_Number: {
                type: DataTypes.TEXT,
            }
		},{
            freezeTableName: true,
			timestamps: false,
            // schema: 'public',
            tableName: 'accomp'
		}
    );
	return ACCOMP;
};
