'use strict';
module.exports = (sequelize, DataTypes) => {
	const JBOOK_CLASSIFICATION = sequelize.define(
		'jbook_classification',
		{
			id: {
				type: DataTypes.INTEGER,
				autoIncrement: true,
				primaryKey: true,
				allowNull: false,
			},
			Proj_Number: {
				type: DataTypes.TEXT,
			},
			'P40-01_LI_Number': {
				type: DataTypes.TEXT,
			},
			line_number: {
				type: DataTypes.TEXT,
			},
			PE_Num: {
				type: DataTypes.TEXT,
			},
			sag_bli: {
				type: DataTypes.TEXT,
			},
			budget_activity: {
				type: DataTypes.TEXT,
			},
			account: {
				type: DataTypes.TEXT,
			},
			foreignID: {
				type: DataTypes.INTEGER,
			},
			budgetYear: {
				type: DataTypes.TEXT,
			},
			docType: {
				type: DataTypes.TEXT,
			},
			inferenceDatetime: {
				type: DataTypes.DATE,
			},
			modelPrediction: {
				type: DataTypes.TEXT,
			},
			modelPredictionProbability: {
				type: DataTypes.DOUBLE,
			},
		},
		{
			freezeTableName: true,
			timestamps: false,
			tableName: 'jbook_classification',
		}
	);
	return JBOOK_CLASSIFICATION;
};
