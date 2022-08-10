'use strict';

module.exports = (sequelize, DataTypes) => {
	return sequelize.define(
		'rdoc_accomp_archive',
		{
			id: {
				type: DataTypes.INTEGER,
				autoIncrement: true,
				primaryKey: true,
			},
			composite_key: {
				type: DataTypes.TEXT,
			},
			PE_Num: {
				type: DataTypes.TEXT,
			},
			Proj_Number: {
				type: DataTypes.TEXT,
			},
			BudgetYear: {
				type: DataTypes.TEXT,
			},
			BudgetCycle: {
				type: DataTypes.TEXT,
			},
			Accomp_Fund_PY: {
				type: DataTypes.DOUBLE,
			},
			Accomp_Fund_PY_Text: {
				type: DataTypes.TEXT,
			},
			PlanPrgrm_Fund_BY1: {
				type: DataTypes.DOUBLE,
			},
			PlanPrgrm_Fund_BY1_Text: {
				type: DataTypes.TEXT,
			},
			PlanPrgrm_Fund_BY1Base: {
				type: DataTypes.DOUBLE,
			},
			PlanPrgrm_Fund_BY1Base_Text: {
				type: DataTypes.TEXT,
			},
			PlanPrgrm_Fund_BY1OCO: {
				type: DataTypes.DOUBLE,
			},
			PlanPrgrm_Fund_BY1OCO_Text: {
				type: DataTypes.TEXT,
			},
			PlanPrgrm_Fund_CY: {
				type: DataTypes.DOUBLE,
			},
			PlanPrgrm_Fund_CY_Text: {
				type: DataTypes.TEXT,
			},
			Accomp_Title_text: {
				type: DataTypes.TEXT,
			},
			Accomp_Desc_text: {
				type: DataTypes.TEXT,
			},

			Accomp_Fund_PY_Text_Search: {
				type: DataTypes.TSVECTOR,
			},
			PlanPrgrm_Fund_BY1_Text_Search: {
				type: DataTypes.TSVECTOR,
			},
			PlanPrgrm_Fund_BY1OCO_Text_Search: {
				type: DataTypes.TSVECTOR,
			},
			PlanPrgrm_Fund_BY1Base_Text_Search: {
				type: DataTypes.TSVECTOR,
			},
			PlanPrgrm_Fund_CY_Text_Search: {
				type: DataTypes.TSVECTOR,
			},
		},
		{
			freezeTableName: true,
			timestamps: false,
			// schema: 'public',
			tableName: 'rdoc_accomp_archive',
		}
	);
};
