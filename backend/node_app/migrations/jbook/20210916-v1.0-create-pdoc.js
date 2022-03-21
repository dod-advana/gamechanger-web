'use strict';
module.exports = {
	up: (queryInterface, Sequelize) => {
		return queryInterface.createTable('pdoc', {
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.INTEGER
			},
			"P40-12_BSA_Number": {
				type: Sequelize.BIGINT
			},
			"P40-01_LI_Number": {
				type: Sequelize.TEXT
			},
			"P3a-17_ModNumber": {
				type: Sequelize.TEXT
			},
			"P40-02_LI_Title": {
				type: Sequelize.TEXT
			},
			"P40-08_Appn_Number": {
				type: Sequelize.TEXT
			},
			"P40-11_BA_Title": {
				type: Sequelize.TEXT
			},
			"P3a-18_ModType": {
				type: Sequelize.TEXT
			},
			"P40-03_P1_LineNumber": {
				type: Sequelize.DOUBLE
			},
			"P40-07_Org_Code": {
				type: Sequelize.TEXT
			},
			"P3a-16_Title": {
				type: Sequelize.TEXT
			},
			"P40-14_IDCode": {
				type: Sequelize.TEXT
			},
			"P40-10_BA_Number": {
				type: Sequelize.BIGINT
			},
			"P40-06_Organization": {
				type: Sequelize.TEXT
			},
			"P40-09_Appn_Title": {
				type: Sequelize.TEXT
			},
			"P40-04_BudgetYear": {
				type: Sequelize.BIGINT
			},
			"P40-13_BSA_Title": {
				type: Sequelize.TEXT
			},
			"P40-05_BudgetCycle": {
				type: Sequelize.TEXT
			},
			"P3a-20_GWSC_BY1": {
				type: Sequelize.DOUBLE
			},
			"P3a-21_ModItem_Title": {
				type: Sequelize.TEXT
			},
			"P3a-22_ModItem_Manuf_Name": {
				type: Sequelize.TEXT
			},
			"P3a-39_ModItem_ProdLeadAftOct1": {
				type: Sequelize.DOUBLE
			},
			"P3a-38_ModItem_AdminLeadAftOct1": {
				type: Sequelize.DOUBLE
			},
			"P3a-23_ModItem_Manuf_Loc": {
				type: Sequelize.TEXT
			},
			"P3a-31_ModItem_DelDate_PY": {
				type: Sequelize.TEXT
			},
			"P3a-24_ModItem_CntrctDate_PY": {
				type: Sequelize.TEXT
			},
			"P3a-25_ModItem_CntrctDate_CY": {
				type: Sequelize.TEXT
			},
			"P3a-32_ModItem_DelDate_CY": {
				type: Sequelize.TEXT
			},
			"P3a-33_ModItem_DelDate_BY1": {
				type: Sequelize.TEXT
			},
			"P3a-26_ModItem_CntrctDate_BY1": {
				type: Sequelize.TEXT
			},
			"P40-15_MDAPCode": {
				type: Sequelize.TEXT
			},
			"P3a-19_ProcQty_BY1": {
				type: Sequelize.DOUBLE
			},
			"P3a-20_Milestone_Desc": {
				type: Sequelize.TEXT
			},
			"P3a-19_Milestone_Title": {
				type: Sequelize.TEXT
			},
			"P3a-18_Milestone_Date": {
				type: Sequelize.TEXT
			},
			"P3a-19_ModItem_Title": {
				type: Sequelize.TEXT
			},
			"P3a-38_ModItem_PEFundCost_BY1": {
				type: Sequelize.DOUBLE
			},
			"P3a-33_ModItem_PEFundCost_APY": {
				type: Sequelize.DOUBLE
			},
			"P3a-34_ModItem_PEFundCost_PY": {
				type: Sequelize.DOUBLE
			},
			"P3a-35_ModItem_PEFundCost_CY": {
				type: Sequelize.DOUBLE
			},
			"P3a-36_ModItem_PEFundCost_BY1Base ": {
				type: Sequelize.DOUBLE
			},
			"P3a-20_ModItem_PENumber": {
				type: Sequelize.TEXT
			},
			"P3a-21_ModItem_PEFundQty_APY": {
				type: Sequelize.DOUBLE
			},
			"P3a-23_ModItem_PEFundQty_CY": {
				type: Sequelize.DOUBLE
			},
			"P3a-24_ModItem_PEFundQty_BY1Base": {
				type: Sequelize.DOUBLE
			},
			"P3a-26_ModItem_PEFundQty_BY1": {
				type: Sequelize.DOUBLE
			},
			"P3a-22_ModItem_PEFundQty_PY": {
				type: Sequelize.DOUBLE
			},
			"P3a-34_InSpares_APY": {
				type: Sequelize.DOUBLE
			},
			"P3a-36_InSpares_CY": {
				type: Sequelize.DOUBLE
			},
			"P3a-35_InSpares_PY": {
				type: Sequelize.DOUBLE
			},
			"P3a-46_GWSCUC_APY": {
				type: Sequelize.DOUBLE
			},
			"P3a-49_GWSCUC_BY1Base": {
				type: Sequelize.DOUBLE
			},
			"P3a-51_GWSCUC_BY1": {
				type: Sequelize.DOUBLE
			},
			"P3a-47_GWSCUC_PY": {
				type: Sequelize.DOUBLE
			},
			"P3a-48_GWSCUC_CY": {
				type: Sequelize.DOUBLE
			},
			"P3a-39_InSpares_BY1": {
				type: Sequelize.DOUBLE
			},
			"P3a-37_InSpares_BY1Base": {
				type: Sequelize.DOUBLE
			},
			"P3a-38_InSpares_BY1OCO": {
				type: Sequelize.DOUBLE
			},
			"P3a-23_OthEntry_PY": {
				type: Sequelize.DOUBLE
			},
			"P3a-21_OthEntry_Name": {
				type: Sequelize.TEXT
			},
			"P3a-24_OthEntry_CY": {
				type: Sequelize.DOUBLE
			},
			"P3a-22_OthEntry_APY": {
				type: Sequelize.DOUBLE
			},
			"P3a-25_OthEntry_BY1Base ": {
				type: Sequelize.DOUBLE
			},
			"P3a-27_OthEntry_BY1": {
				type: Sequelize.DOUBLE
			},
			"P3a-40_GWSC_BY1": {
				type: Sequelize.DOUBLE
			},
			"P3a-63_NetP1_BY1OCO": {
				type: Sequelize.DOUBLE
			},
			"P3a-39_GWSC_BY1OCO": {
				type: Sequelize.DOUBLE
			},
			"P3a-36_GWSC_PY": {
				type: Sequelize.DOUBLE
			},
			"P3a-64_NetP1_BY1": {
				type: Sequelize.DOUBLE
			},
			"P3a-37_GWSC_CY": {
				type: Sequelize.DOUBLE
			},
			"P3a-35_GWSC_APY ": {
				type: Sequelize.DOUBLE
			},
			"P3a-86_TOA_BY1Base": {
				type: Sequelize.DOUBLE
			},
			"P3a-60_NetP1_PY": {
				type: Sequelize.DOUBLE
			},
			"P3a-59_NetP1_APY": {
				type: Sequelize.DOUBLE
			},
			"P3a-38_GWSC_BY1Base": {
				type: Sequelize.DOUBLE
			},
			"P3a-87_TOA_BY1OCO": {
				type: Sequelize.DOUBLE
			},
			"P3a-84_TOA_PY": {
				type: Sequelize.DOUBLE
			},
			"P3a-88_TOA_BY1": {
				type: Sequelize.DOUBLE
			},
			"P3a-83_TOA_APY": {
				type: Sequelize.DOUBLE
			},
			"P3a-62_NetP1_BY1Base": {
				type: Sequelize.DOUBLE
			},
			"P3a-85_TOA_CY": {
				type: Sequelize.DOUBLE
			},
			"P3a-61_NetP1_CY": {
				type: Sequelize.DOUBLE
			},
			"P3a-19_IDCode": {
				type: Sequelize.TEXT
			},
			"P3a-71_PlusCYAP_APY": {
				type: Sequelize.DOUBLE
			},
			"P3a-52_LessPYAP_BY1": {
				type: Sequelize.DOUBLE
			},
			"P3a-74_PlusCYAP_BY1Base": {
				type: Sequelize.DOUBLE
			},
			"P3a-76_PlusCYAP_BY1": {
				type: Sequelize.DOUBLE
			},
			"P3a-50_LessPYAP_BY1Base": {
				type: Sequelize.DOUBLE
			},
			"P3a-73_PlusCYAP_CY": {
				type: Sequelize.DOUBLE
			},
			"P3a-72_PlusCYAP_PY": {
				type: Sequelize.DOUBLE
			},
			"P3a-47_LessPYAP_APY": {
				type: Sequelize.DOUBLE
			},
			"P3a-22_APYDelta_Qty": {
				type: Sequelize.TEXT
			},
			"P3a-28_ProcQty_BY1": {
				type: Sequelize.DOUBLE
			},
			"P3a-24_ProcQty_PY": {
				type: Sequelize.DOUBLE
			},
			"P3a-26_ProcQty_BY1Base": {
				type: Sequelize.DOUBLE
			},
			"P3a-23_ProcQty_APY": {
				type: Sequelize.DOUBLE
			},
			"P3a-25_ProcQty_CY": {
				type: Sequelize.DOUBLE
			},
			"P3a-31_SecDist_CompTOA_PY": {
				type: Sequelize.DOUBLE
			},
			"P3a-21_SecDist_Comp_Name": {
				type: Sequelize.TEXT
			},
			"P3a-35_SecDist_CompTOA_BY1": {
				type: Sequelize.DOUBLE
			},
			"P3a-33_SecDist_CompTOA_BY1Base": {
				type: Sequelize.DOUBLE
			},
			"P3a-32_SecDist_CompTOA_CY": {
				type: Sequelize.DOUBLE
			},
			"P3a-26_SecDist_CompQty_BY1": {
				type: Sequelize.DOUBLE
			},
			"P3a-24_SecDist_CompQty_BY1Base": {
				type: Sequelize.DOUBLE
			},
			"P3a-23_SecDist_CompQty_CY": {
				type: Sequelize.DOUBLE
			},
			"P3a-22_SecDist_CompQty_PY": {
				type: Sequelize.DOUBLE
			},
			"P3a-25_SecDist_CompQty_BY1OCO": {
				type: Sequelize.DOUBLE
			},
			"P3a-34_SecDist_CompTOA_BY1OCO": {
				type: Sequelize.DOUBLE
			},
			"P3a-33_Spt_CECost_PY": {
				type: Sequelize.DOUBLE
			},
			"P3a-32_Spt_CECost_APY": {
				type: Sequelize.DOUBLE
			},
			"P3a-19_Spt_CE_Name": {
				type: Sequelize.TEXT
			},
			"P3a-36_Spt_CECost_BY1OCO": {
				type: Sequelize.DOUBLE
			},
			"P3a-34_Spt_CECost_CY": {
				type: Sequelize.DOUBLE
			},
			"P3a-37_Spt_CECost_BY1": {
				type: Sequelize.DOUBLE
			},
			"P3a-35_Spt_CECost_BY1Base": {
				type: Sequelize.DOUBLE
			},
			"P3a-56_Spt_TotCost_APY": {
				type: Sequelize.DOUBLE
			},
			"P3a-57_Spt_TotCost_PY": {
				type: Sequelize.DOUBLE
			},
			"P3a-58_Spt_TotCost_CY": {
				type: Sequelize.DOUBLE
			},
			"P3a-59_Spt_TotCost_BY1Base": {
				type: Sequelize.DOUBLE
			},
			"P3a-61_Spt_TotCost_BY1": {
				type: Sequelize.DOUBLE
			},
			"P3a-20_Spt_CEQty_APY": {
				type: Sequelize.DOUBLE
			},
			"P3a-23_Spt_CEQty_BY1Base": {
				type: Sequelize.DOUBLE
			},
			"P3a-21_Spt_CEQty_PY": {
				type: Sequelize.DOUBLE
			},
			"P3a-25_Spt_CEQty_BY1": {
				type: Sequelize.DOUBLE
			},
			"P3a-44_Spt_TotQty_APY": {
				type: Sequelize.DOUBLE
			},
			"P3a-45_Spt_TotQty_PY": {
				type: Sequelize.DOUBLE
			},
			"P3a-49_Spt_TotQty_BY1": {
				type: Sequelize.DOUBLE
			},
			"P3a-47_Spt_TotQty_BY1Base": {
				type: Sequelize.DOUBLE
			},
			"P3a-22_Spt_CEQty_CY": {
				type: Sequelize.DOUBLE
			},
			"P3a-46_Spt_TotQty_CY": {
				type: Sequelize.DOUBLE
			},
			"P40-16_OthRel_PE": {
				type: Sequelize.TEXT
			},
			"P40-27_OYDelta_Cost_TOT": {
				type: Sequelize.DOUBLE
			},
			"P40-26_OYDelta_Cost_TC": {
				type: Sequelize.DOUBLE
			},
			"P40-29_APYDelta_Cost": {
				type: Sequelize.DOUBLE
			},
			"P40-28_APYDelta_Qty": {
				type: Sequelize.DOUBLE
			},
			"P40-18_OthEntry_PY": {
				type: Sequelize.DOUBLE
			},
			"P40-16_OthEntry_Name": {
				type: Sequelize.TEXT
			},
			"P40-19_OthEntry_CY ": {
				type: Sequelize.DOUBLE
			},
			"P40-17_OthEntry_APY": {
				type: Sequelize.DOUBLE
			},
			"P40-20_OthEntry_BY1Base": {
				type: Sequelize.DOUBLE
			},
			"P40-22_OthEntry_BY1": {
				type: Sequelize.DOUBLE
			}
		});
	},
	down: (queryInterface, Sequelize) => {
		return queryInterface.dropTable('pdoc');
	}
};