'use strict';
module.exports = (sequelize, DataTypes) => {
	const RDOC = sequelize.define(
		'rdoc',
		{
			id: {
				type: DataTypes.INTEGER,
				autoIncrement: true,
				primaryKey: true,
			},
			composite_key: {
				type: DataTypes.TEXT,
			},
			filename: {
				type: DataTypes.TEXT,
			},
			Accomp_Fund_PY: {
				type: DataTypes.DOUBLE,
			},
			Accomp_Fund_PY_Text: {
				type: DataTypes.TEXT,
			},
			Adj_CongAdds_CY: {
				type: DataTypes.DOUBLE,
			},
			Adj_CongAdds_PY: {
				type: DataTypes.DOUBLE,
			},
			Adj_CongDirRed_CY: {
				type: DataTypes.DOUBLE,
			},
			Adj_CongDirRed_PY: {
				type: DataTypes.DOUBLE,
			},
			Adj_CongDirTrans_CY: {
				type: DataTypes.DOUBLE,
			},
			Adj_CongDirTrans_PY: {
				type: DataTypes.DOUBLE,
			},
			Adj_CongGenRed_CY: {
				type: DataTypes.DOUBLE,
			},
			Adj_CongGenRed_PY: {
				type: DataTypes.DOUBLE,
			},
			Adj_CongResc_CY: {
				type: DataTypes.DOUBLE,
			},
			Adj_CongResc_PY: {
				type: DataTypes.DOUBLE,
			},
			Adj_OtherAdj_BY1: {
				type: DataTypes.DOUBLE,
			},
			Adj_OtherAdj_BY1Base: {
				type: DataTypes.DOUBLE,
			},
			Adj_OtherAdj_BY1OCO: {
				type: DataTypes.DOUBLE,
			},
			Adj_OtherAdj_CY: {
				type: DataTypes.DOUBLE,
			},
			Adj_OtherAdj_PY: {
				type: DataTypes.DOUBLE,
			},
			Adj_OtherAdj_Title: {
				type: DataTypes.TEXT,
			},
			Adj_Reprog_CY: {
				type: DataTypes.DOUBLE,
			},
			Adj_Reprog_PY: {
				type: DataTypes.DOUBLE,
			},
			Adj_SBIRSTTRTrans_CY: {
				type: DataTypes.DOUBLE,
			},
			Adj_SBIRSTTRTrans_PY: {
				type: DataTypes.DOUBLE,
			},
			Adj_Total_BY1: {
				type: DataTypes.DOUBLE,
			},
			Adj_Total_BY1Base: {
				type: DataTypes.DOUBLE,
			},
			Adj_Total_BY1OCO: {
				type: DataTypes.DOUBLE,
			},
			Adj_Total_CY: {
				type: DataTypes.DOUBLE,
			},
			Adj_Total_PY: {
				type: DataTypes.DOUBLE,
			},
			Appn_Num: {
				type: DataTypes.TEXT,
			},
			Appn_Title: {
				type: DataTypes.TEXT,
			},
			ArticlesQty_APY: {
				type: DataTypes.DOUBLE,
			},
			ArticlesQty_BY1: {
				type: DataTypes.DOUBLE,
			},
			ArticlesQty_BY1Base: {
				type: DataTypes.DOUBLE,
			},
			ArticlesQty_BY1OCO: {
				type: DataTypes.DOUBLE,
			},
			ArticlesQty_BY2: {
				type: DataTypes.DOUBLE,
			},
			ArticlesQty_BY3: {
				type: DataTypes.DOUBLE,
			},
			ArticlesQty_BY4: {
				type: DataTypes.DOUBLE,
			},
			ArticlesQty_BY5: {
				type: DataTypes.DOUBLE,
			},
			ArticlesQty_CY: {
				type: DataTypes.DOUBLE,
			},
			ArticlesQty_PY: {
				type: DataTypes.DOUBLE,
			},
			AwardDate_BY1Base: {
				type: DataTypes.TEXT,
			},
			AwardDate_BY1OCO: {
				type: DataTypes.TEXT,
			},
			AwardDate_CY: {
				type: DataTypes.TEXT,
			},
			AwardDate_PY: {
				type: DataTypes.TEXT,
			},
			BA_Number: {
				type: DataTypes.TEXT,
			},
			BA_Title: {
				type: DataTypes.TEXT,
			},
			BudgetCycle: {
				type: DataTypes.TEXT,
			},
			BudgetYear: {
				type: DataTypes.TEXT,
			},
			ChngSum_CurPB_BY1: {
				type: DataTypes.DOUBLE,
			},
			ChngSum_CurPB_BY1BASE: {
				type: DataTypes.DOUBLE,
			},
			ChngSum_CurPB_BY1OCO: {
				type: DataTypes.DOUBLE,
			},
			ChngSum_CurPB_CY: {
				type: DataTypes.DOUBLE,
			},
			ChngSum_CurPB_PY: {
				type: DataTypes.DOUBLE,
			},
			ChngSum_PrevPB_BY1: {
				type: DataTypes.DOUBLE,
			},
			ChngSum_PrevPB_BYBASE: {
				type: DataTypes.DOUBLE,
			},
			ChngSum_PrevPB_BYOCO: {
				type: DataTypes.DOUBLE,
			},
			ChngSum_PrevPB_CY: {
				type: DataTypes.DOUBLE,
			},
			ChngSum_PrevPB_PY: {
				type: DataTypes.DOUBLE,
			},
			CongAdds_Fund_CY: {
				type: DataTypes.DOUBLE,
			},
			CongAdds_Fund_PY: {
				type: DataTypes.DOUBLE,
			},
			CongAdds_Title: {
				type: DataTypes.TEXT,
			},
			ContractMethod: {
				type: DataTypes.TEXT,
			},
			ContractType: {
				type: DataTypes.TEXT,
			},
			CostCat_Item_Name: {
				type: DataTypes.TEXT,
			},
			CostCat_Item_PerfAct_Location: {
				type: DataTypes.TEXT,
			},
			CostCat_Item_PerfAct: {
				type: DataTypes.TEXT,
			},
			CostCat_Name: {
				type: DataTypes.TEXT,
			},
			costCatItemCostAPY: {
				type: DataTypes.DOUBLE,
			},
			costCatItemCostBY1: {
				type: DataTypes.DOUBLE,
			},
			costCatItemCostBY1Base: {
				type: DataTypes.DOUBLE,
			},
			costCatItemCostBY1OCO: {
				type: DataTypes.DOUBLE,
			},
			costCatItemCostCTC: {
				type: DataTypes.TEXT,
			},
			costCatItemCostCY: {
				type: DataTypes.DOUBLE,
			},
			costCatItemCostPY: {
				type: DataTypes.DOUBLE,
			},
			costCatItemCostTotal: {
				type: DataTypes.TEXT,
			},
			costCatItemCostTV: {
				type: DataTypes.TEXT,
			},
			costCatItemName: {
				type: DataTypes.TEXT,
			},
			costCatName: {
				type: DataTypes.TEXT,
			},
			EndDate: {
				type: DataTypes.TEXT,
			},
			EndQuarter: {
				type: DataTypes.TEXT,
			},
			EndYear: {
				type: DataTypes.TEXT,
			},
			Event_Title: {
				type: DataTypes.TEXT,
			},
			FundingVehicle: {
				type: DataTypes.TEXT,
			},
			JointFund_APY: {
				type: DataTypes.DOUBLE,
			},
			JointFund_BY1: {
				type: DataTypes.DOUBLE,
			},
			JointFund_BY1Base: {
				type: DataTypes.DOUBLE,
			},
			JointFund_BY1OCO: {
				type: DataTypes.DOUBLE,
			},
			JointFund_CTC: {
				type: DataTypes.TEXT,
			},
			JointFund_CY: {
				type: DataTypes.DOUBLE,
			},
			JointFund_PY: {
				type: DataTypes.DOUBLE,
			},
			JointFund_Title: {
				type: DataTypes.TEXT,
			},
			JointFund_Total: {
				type: DataTypes.TEXT,
			},
			JointFund_TV: {
				type: DataTypes.TEXT,
			},
			location: {
				type: DataTypes.TEXT,
			},
			Organization: {
				type: DataTypes.TEXT,
			},
			OrganizationCode: {
				type: DataTypes.TEXT,
			},
			OthProgFund_BY1: {
				type: DataTypes.DOUBLE,
			},
			OthProgFund_BY1Base: {
				type: DataTypes.DOUBLE,
			},
			OthProgFund_BY2: {
				type: DataTypes.DOUBLE,
			},
			OthProgFund_BY3: {
				type: DataTypes.DOUBLE,
			},
			OthProgFund_BY4: {
				type: DataTypes.DOUBLE,
			},
			OthProgFund_BY5: {
				type: DataTypes.DOUBLE,
			},
			OthProgFund_CTC: {
				type: DataTypes.TEXT,
			},
			OthProgFund_CY: {
				type: DataTypes.DOUBLE,
			},
			OthProgFund_LineItem: {
				type: DataTypes.TEXT,
			},
			OthProgFund_PY: {
				type: DataTypes.DOUBLE,
			},
			OthProgFund_Title: {
				type: DataTypes.TEXT,
			},
			OthProgFund_Ttoal: {
				type: DataTypes.TEXT,
			},
			PE_MDAP_Code: {
				type: DataTypes.TEXT,
			},
			PE_MSN_Dsec: {
				type: DataTypes.TEXT,
			},
			PE_Num: {
				type: DataTypes.TEXT,
			},
			PE_Title: {
				type: DataTypes.TEXT,
			},
			PEFund_APY: {
				type: DataTypes.DOUBLE,
			},
			PEFund_BY1: {
				type: DataTypes.DOUBLE,
			},
			PEFund_BY1Base: {
				type: DataTypes.DOUBLE,
			},
			PEFund_BY1OCO: {
				type: DataTypes.DOUBLE,
			},
			PEFund_BY2: {
				type: DataTypes.DOUBLE,
			},
			PEFund_BY3: {
				type: DataTypes.DOUBLE,
			},
			PEFund_BY4: {
				type: DataTypes.DOUBLE,
			},
			PEFund_BY5: {
				type: DataTypes.DOUBLE,
			},
			PEFund_CTC: {
				type: DataTypes.TEXT,
			},
			PEFund_CY: {
				type: DataTypes.DOUBLE,
			},
			PEFund_PY: {
				type: DataTypes.DOUBLE,
			},
			PEFund_Total: {
				type: DataTypes.TEXT,
			},
			performingActivity: {
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
			Proj_Fund_APY: {
				type: DataTypes.DOUBLE,
			},
			Proj_Fund_BY1: {
				type: DataTypes.DOUBLE,
			},
			Proj_Fund_BY1Base: {
				type: DataTypes.DOUBLE,
			},
			Proj_Fund_BY1OCO: {
				type: DataTypes.DOUBLE,
			},
			Proj_Fund_BY2: {
				type: DataTypes.DOUBLE,
			},
			Proj_Fund_BY3: {
				type: DataTypes.DOUBLE,
			},
			Proj_Fund_BY4: {
				type: DataTypes.DOUBLE,
			},
			Proj_Fund_BY5: {
				type: DataTypes.DOUBLE,
			},
			Proj_Fund_CTC: {
				type: DataTypes.TEXT,
			},
			Proj_Fund_CY: {
				type: DataTypes.DOUBLE,
			},
			Proj_Fund_PY: {
				type: DataTypes.DOUBLE,
			},
			Proj_Fund_Total: {
				type: DataTypes.TEXT,
			},
			Proj_MDAP_Code: {
				type: DataTypes.TEXT,
			},
			Proj_Number: {
				type: DataTypes.TEXT,
			},
			Proj_Title: {
				type: DataTypes.TEXT,
			},
			R1_Line_Num: {
				type: DataTypes.TEXT,
			},
			StartDate: {
				type: DataTypes.TEXT,
			},
			StartQuarter: {
				type: DataTypes.TEXT,
			},
			StartYear: {
				type: DataTypes.TEXT,
			},
			SubProj_Title: {
				type: DataTypes.TEXT,
			},
			Proj_MSN_Desc: {
				type: DataTypes.TEXT,
			},
			Proj_Notes: {
				type: DataTypes.TEXT,
			},
			Proj_Aquisition_Startegy: {
				type: DataTypes.TEXT,
			},
			Proj_Performance_Metrics: {
				type: DataTypes.TEXT,
			},
			OthProgFund_Summary_Remarks: {
				type: DataTypes.TEXT,
			},
			Proj_Fund_BY1: {
				type: DataTypes.TEXT,
			},
			Proj_Fund_APY: {
				type: DataTypes.TEXT,
			},

			Accomp_Fund_PY_Text_Search: {
				type: DataTypes.TSVECTOR,
			},
			Adj_OtherAdj_Title_Search: {
				type: DataTypes.TSVECTOR,
			},
			Appn_Title_Search: {
				type: DataTypes.TSVECTOR,
			},
			BA_Title_Search: {
				type: DataTypes.TSVECTOR,
			},
			CongAdds_Title_Search: {
				type: DataTypes.TSVECTOR,
			},
			Event_Title_Search: {
				type: DataTypes.TSVECTOR,
			},
			JointFund_Title_Search: {
				type: DataTypes.TSVECTOR,
			},
			OthProgFund_Title_Search: {
				type: DataTypes.TSVECTOR,
			},
			PE_MSN_Dsec_Search: {
				type: DataTypes.TSVECTOR,
			},
			PE_Title_Search: {
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
			Proj_Title_Search: {
				type: DataTypes.TSVECTOR,
			},
			SubProj_Title_Search: {
				type: DataTypes.TSVECTOR,
			},
			Proj_MSN_Desc_Search: {
				type: DataTypes.TSVECTOR,
			},
			Proj_Notes_Search: {
				type: DataTypes.TSVECTOR,
			},
			Proj_Aquisition_Startegy_Search: {
				type: DataTypes.TSVECTOR,
			},
			Proj_Performance_Metrics_Search: {
				type: DataTypes.TSVECTOR,
			},
			OthProgFund_Summary_Remarks_Search: {
				type: DataTypes.TSVECTOR,
			},
		},
		{
			freezeTableName: true,
			timestamps: false,
			tableName: 'rdoc',
		}
	);
	return RDOC;
};
