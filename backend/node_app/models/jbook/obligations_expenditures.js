'use strict';
module.exports = (sequelize, DataTypes) => {
	return sequelize.define('obligations_expenditures',
		{
			id: {
				type: DataTypes.INTEGER,
				autoIncrement: true,
				primaryKey: true,
			},
			bli: {
				type: DataTypes.TEXT,
			},
			department_code: {
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
			yearmonth: {
				type: DataTypes.TEXT,
			},
			organization: {
				type: DataTypes.TEXT,
			},
			begfy: {
				type: DataTypes.TEXT,
			},
			endfy: {
				type: DataTypes.TEXT,
			},
			cumulative_obligations: {
				type: DataTypes.TEXT,
			},
            cumulative_disbursements: {
				type: DataTypes.TEXT,
			},
            doc_type: {
				type: DataTypes.TEXT,
			},
		}, {
			freezeTableName: true,
			timestamps: false,
			tableName: 'obligations_expenditures'
		}
	);
};
