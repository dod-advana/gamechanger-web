'use strict';
module.exports = (sequelize, DataTypes) => {
	const PDOC = sequelize.define('pdoc',
		{
			id: {
				type: DataTypes.INTEGER,
				autoIncrement: true,
				primaryKey: true,
			},
			composite_key : {
                type: DataTypes.TEXT,
            },
			"filename": {
				type: DataTypes.TEXT
			},
			"P3a_InstSched_IN_APY_": {
				type: DataTypes.DOUBLE
			},
			"P3a_InstSched_OUT_APY_": {
				type: DataTypes.DOUBLE
			},
			"P3a-101_Proc_SubTotQty_BY1": {
				type: DataTypes.DOUBLE
			},
			"P3a-108_Proc_SubTotCost_APY": {
				type: DataTypes.DOUBLE
			},
			"P3a-109_Proc_SubTotCost_PY": {
				type: DataTypes.DOUBLE
			},
			"P3a-110_Proc_SubTotCost_CY": {
				type: DataTypes.DOUBLE
			},
			"P3a-111_Proc_SubTotCost_BY1Base": {
				type: DataTypes.DOUBLE
			},
			"P3a-113_Proc_SubTotCost_BY1": {
				type: DataTypes.DOUBLE
			},
			"P3a-146_InstBY1_APYQty": {
				type: DataTypes.DOUBLE
			},
			"P3a-148_InstBY1_CYQty": {
				type: DataTypes.DOUBLE
			},
			"P3a-149_InstBY1_BY1BaseQty": {
				type: DataTypes.DOUBLE
			},
			"P3a-150_InstBY1_BY1OCOQty": {
				type: DataTypes.DOUBLE
			},
			"P3a-151_InstBY1_BY1Qty": {
				type: DataTypes.DOUBLE
			},
			"P3a-158_InstBY1_APYCost": {
				type: DataTypes.DOUBLE
			},
			"P3a-16_Title": {
				type: DataTypes.TEXT
			},
			"P3a-160_InstBY1_CYCost": {
				type: DataTypes.DOUBLE
			},
			"P3a-161_InstBY1_BY1BaseCost": {
				type: DataTypes.DOUBLE
			},
			"P3a-162_InstBY1_BY1OCOCost": {
				type: DataTypes.DOUBLE
			},
			"P3a-163_InstBY1_BY1Cost": {
				type: DataTypes.DOUBLE
			},
			"P3a-17_ModNumber": {
				type: DataTypes.TEXT
			},
			"P3a-173_InstBY2_BY1BaseQty": {
				type: DataTypes.DOUBLE
			},
			"P3a-174_InstBY2_BY1OCOQty": {
				type: DataTypes.DOUBLE
			},
			"P3a-175_InstBY2_BY1Qty": {
				type: DataTypes.DOUBLE
			},
			"P3a-18_Milestone_Date": {
				type: DataTypes.TEXT
			},
			"P3a-18_ModType": {
				type: DataTypes.TEXT
			},
			"P3a-18_Rel_PE": {
				type: DataTypes.TEXT
			},
			"P3a-185_InstBY2_BY1BaseCost": {
				type: DataTypes.DOUBLE
			},
			"P3a-186_InstBY2_BY1OCOCost": {
				type: DataTypes.DOUBLE
			},
			"P3a-187_InstBY2_BY1Cost": {
				type: DataTypes.DOUBLE
			},
			"P3a-19_IDCode": {
				type: DataTypes.TEXT
			},
			"P3a-19_Milestone_Title": {
				type: DataTypes.TEXT
			},
			"P3a-19_ModItem_Title": {
				type: DataTypes.TEXT
			},
			"P3a-19_ProcQty_BY1": {
				type: DataTypes.DOUBLE
			},
			"P3a-19_Spt_CE_Name": {
				type: DataTypes.TEXT
			},
			"P3a-197_InstBY3_BY1BaseQty": {
				type: DataTypes.DOUBLE
			},
			"P3a-199_InstBY3_BY1Qty": {
				type: DataTypes.DOUBLE
			},
			"P3a-20_GWSC_BY1": {
				type: DataTypes.DOUBLE
			},
			"P3a-20_Milestone_Desc": {
				type: DataTypes.TEXT
			},
			"P3a-20_ModItem_PENumber": {
				type: DataTypes.TEXT
			},
			"P3a-20_Spt_CEQty_APY": {
				type: DataTypes.DOUBLE
			},
			"P3a-209_InstBY3_BY1BaseCost": {
				type: DataTypes.DOUBLE
			},
			"P3a-21_ModItem_PEFundQty_APY": {
				type: DataTypes.DOUBLE
			},
			"P3a-21_ModItem_Title": {
				type: DataTypes.TEXT
			},
			"P3a-21_NonOrgInst_Name": {
				type: DataTypes.TEXT
			},
			"P3a-21_OthEntry_Name": {
				type: DataTypes.TEXT
			},
			"P3a-21_SecDist_Comp_Name": {
				type: DataTypes.TEXT
			},
			"P3a-21_Spt_CEQty_PY": {
				type: DataTypes.DOUBLE
			},
			"P3a-211_InstBY3_BY1Cost": {
				type: DataTypes.DOUBLE
			},
			"P3a-22_APYDelta_Qty": {
				type: DataTypes.TEXT
			},
			"P3a-22_ModItem_Manuf_Name": {
				type: DataTypes.TEXT
			},
			"P3a-22_ModItem_PEFundQty_PY": {
				type: DataTypes.DOUBLE
			},
			"P3a-22_OthEntry_APY": {
				type: DataTypes.DOUBLE
			},
			"P3a-22_SecDist_CompQty_PY": {
				type: DataTypes.DOUBLE
			},
			"P3a-22_Spt_CEQty_CY": {
				type: DataTypes.DOUBLE
			},
			"P3a-23_ModItem_Manuf_Loc": {
				type: DataTypes.TEXT
			},
			"P3a-23_ModItem_PEFundQty_CY": {
				type: DataTypes.DOUBLE
			},
			"P3a-23_OrgInst_Name": {
				type: DataTypes.TEXT
			},
			"P3a-23_OthEntry_PY": {
				type: DataTypes.DOUBLE
			},
			"P3a-23_ProcQty_APY": {
				type: DataTypes.DOUBLE
			},
			"P3a-23_SecDist_CompQty_CY": {
				type: DataTypes.DOUBLE
			},
			"P3a-23_Spt_CEQty_BY1Base": {
				type: DataTypes.DOUBLE
			},
			"P3a-24_ModItem_CntrctDate_PY": {
				type: DataTypes.TEXT
			},
			"P3a-24_ModItem_PEFundQty_BY1Base": {
				type: DataTypes.DOUBLE
			},
			"P3a-24_OrgInst_Qty": {
				type: DataTypes.DOUBLE
			},
			"P3a-24_OthEntry_CY": {
				type: DataTypes.DOUBLE
			},
			"P3a-24_ProcQty_PY": {
				type: DataTypes.DOUBLE
			},
			"P3a-24_SecDist_CompQty_BY1Base": {
				type: DataTypes.DOUBLE
			},
			"P3a-25_InstAPY_APYQty": {
				type: DataTypes.DOUBLE
			},
			"P3a-25_ModItem_CntrctDate_CY": {
				type: DataTypes.TEXT
			},
			"P3a-25_OthEntry_BY1Base": {
				type: DataTypes.DOUBLE
			},
			"P3a-25_ProcQty_CY": {
				type: DataTypes.DOUBLE
			},
			"P3a-25_SecDist_CompQty_BY1OCO": {
				type: DataTypes.DOUBLE
			},
			"P3a-25_Spt_CEQty_BY1": {
				type: DataTypes.DOUBLE
			},
			"P3a-26_InstAPY_PYQty": {
				type: DataTypes.DOUBLE
			},
			"P3a-26_ModItem_CntrctDate_BY1": {
				type: DataTypes.TEXT
			},
			"P3a-26_ModItem_PEFundQty_BY1": {
				type: DataTypes.DOUBLE
			},
			"P3a-26_ProcQty_BY1Base": {
				type: DataTypes.DOUBLE
			},
			"P3a-26_SecDist_CompQty_BY1": {
				type: DataTypes.DOUBLE
			},
			"P3a-27_InstAPY_CYQty": {
				type: DataTypes.DOUBLE
			},
			"P3a-27_OthEntry_BY1": {
				type: DataTypes.DOUBLE
			},
			"P3a-28_InstAPY_BY1BaseQty": {
				type: DataTypes.DOUBLE
			},
			"P3a-28_ProcQty_BY1": {
				type: DataTypes.DOUBLE
			},
			"P3a-29_InstAPY_BY1OCOQty": {
				type: DataTypes.DOUBLE
			},
			"P3a-290_InstTOT_APYQty": {
				type: DataTypes.DOUBLE
			},
			"P3a-291_InstTOT_PYQty": {
				type: DataTypes.DOUBLE
			},
			"P3a-292_InstTOT_CYQty": {
				type: DataTypes.DOUBLE
			},
			"P3a-293_InstTOT_BY1BaseQty": {
				type: DataTypes.DOUBLE
			},
			"P3a-294_InstTOT_BY1OCOQty": {
				type: DataTypes.DOUBLE
			},
			"P3a-295_InstTOT_BY1Qty": {
				type: DataTypes.DOUBLE
			},
			"P3a-30_InstAPY_BY1Qty": {
				type: DataTypes.DOUBLE
			},
			"P3a-302_InstTOT_APYCost": {
				type: DataTypes.DOUBLE
			},
			"P3a-303_InstTOT_PYCost": {
				type: DataTypes.DOUBLE
			},
			"P3a-304_InstTOT_CYCost": {
				type: DataTypes.DOUBLE
			},
			"P3a-305_InstTOT_BY1BaseCost": {
				type: DataTypes.DOUBLE
			},
			"P3a-306_InstTOT_BY1OCOCost": {
				type: DataTypes.DOUBLE
			},
			"P3a-307_InstTOT_BY1Cost": {
				type: DataTypes.DOUBLE
			},
			"P3a-31_ModItem_DelDate_PY": {
				type: DataTypes.TEXT
			},
			"P3a-31_SecDist_CompTOA_PY": {
				type: DataTypes.DOUBLE
			},
			"P3a-314_Inst_SubTotQty_APY": {
				type: DataTypes.DOUBLE
			},
			"P3a-315_Inst_SubTotQty_PY": {
				type: DataTypes.DOUBLE
			},
			"P3a-316_Inst_SubTotQty_CY": {
				type: DataTypes.DOUBLE
			},
			"P3a-317_Inst_SubTotQty_BY1Base": {
				type: DataTypes.DOUBLE
			},
			"P3a-319_Inst_SubTotQty_BY1": {
				type: DataTypes.DOUBLE
			},
			"P3a-32_ModItem_DelDate_CY": {
				type: DataTypes.TEXT
			},
			"P3a-32_SecDist_CompTOA_CY": {
				type: DataTypes.DOUBLE
			},
			"P3a-32_Spt_CECost_APY": {
				type: DataTypes.DOUBLE
			},
			"P3a-326_Inst_SubTotCost_APY": {
				type: DataTypes.DOUBLE
			},
			"P3a-327_Inst_SubTotCost_PY": {
				type: DataTypes.DOUBLE
			},
			"P3a-328_Inst_SubTotCost_CY": {
				type: DataTypes.DOUBLE
			},
			"P3a-329_Inst_SubTotCost_BY1Base": {
				type: DataTypes.DOUBLE
			},
			"P3a-33_ModItem_DelDate_BY1": {
				type: DataTypes.TEXT
			},
			"P3a-33_ModItem_PEFundCost_APY": {
				type: DataTypes.DOUBLE
			},
			"P3a-33_SecDist_CompTOA_BY1Base": {
				type: DataTypes.DOUBLE
			},
			"P3a-33_Spt_CECost_PY": {
				type: DataTypes.DOUBLE
			},
			"P3a-331_Inst_SubTotCost_BY1": {
				type: DataTypes.DOUBLE
			},
			"P3a-34_InSpares_APY": {
				type: DataTypes.DOUBLE
			},
			"P3a-34_ModItem_PEFundCost_PY": {
				type: DataTypes.DOUBLE
			},
			"P3a-34_SecDist_CompTOA_BY1OCO": {
				type: DataTypes.DOUBLE
			},
			"P3a-34_Spt_CECost_CY": {
				type: DataTypes.DOUBLE
			},
			"P3a-35_GWSC_APY": {
				type: DataTypes.DOUBLE
			},
			"P3a-35_InSpares_PY": {
				type: DataTypes.DOUBLE
			},
			"P3a-35_ModItem_PEFundCost_CY": {
				type: DataTypes.DOUBLE
			},
			"P3a-35_SecDist_CompTOA_BY1": {
				type: DataTypes.DOUBLE
			},
			"P3a-35_Spt_CECost_BY1Base": {
				type: DataTypes.DOUBLE
			},
			"P3a-36_GWSC_PY": {
				type: DataTypes.DOUBLE
			},
			"P3a-36_InSpares_CY": {
				type: DataTypes.DOUBLE
			},
			"P3a-36_ModItem_PEFundCost_BY1Base": {
				type: DataTypes.DOUBLE
			},
			"P3a-36_Spt_CECost_BY1OCO": {
				type: DataTypes.DOUBLE
			},
			"P3a-37_GWSC_CY": {
				type: DataTypes.DOUBLE
			},
			"P3a-37_InSpares_BY1Base": {
				type: DataTypes.DOUBLE
			},
			"P3a-37_InstAPY_APYCost": {
				type: DataTypes.DOUBLE
			},
			"P3a-37_Spt_CECost_BY1": {
				type: DataTypes.DOUBLE
			},
			"P3a-38_GWSC_BY1Base": {
				type: DataTypes.DOUBLE
			},
			"P3a-38_InSpares_BY1OCO": {
				type: DataTypes.DOUBLE
			},
			"P3a-38_InstAPY_PYCost": {
				type: DataTypes.DOUBLE
			},
			"P3a-38_ModItem_AdminLeadAftOct1": {
				type: DataTypes.DOUBLE
			},
			"P3a-38_ModItem_PEFundCost_BY1": {
				type: DataTypes.DOUBLE
			},
			"P3a-39_GWSC_BY1OCO": {
				type: DataTypes.DOUBLE
			},
			"P3a-39_InSpares_BY1": {
				type: DataTypes.DOUBLE
			},
			"P3a-39_InstAPY_CYCost": {
				type: DataTypes.DOUBLE
			},
			"P3a-39_ModItem_ProdLeadAftOct1": {
				type: DataTypes.DOUBLE
			},
			"P3a-40_GWSC_BY1": {
				type: DataTypes.DOUBLE
			},
			"P3a-40_InstAPY_BY1BaseCost": {
				type: DataTypes.DOUBLE
			},
			"P3a-41_InstAPY_BY1OCOCost": {
				type: DataTypes.DOUBLE
			},
			"P3a-42_InstAPY_BY1Cost": {
				type: DataTypes.DOUBLE
			},
			"P3a-44_Spt_TotQty_APY": {
				type: DataTypes.DOUBLE
			},
			"P3a-45_Spt_TotQty_PY": {
				type: DataTypes.DOUBLE
			},
			"P3a-46_GWSCUC_APY": {
				type: DataTypes.DOUBLE
			},
			"P3a-46_Spt_TotQty_CY": {
				type: DataTypes.DOUBLE
			},
			"P3a-47_GWSCUC_PY": {
				type: DataTypes.DOUBLE
			},
			"P3a-47_LessPYAP_APY": {
				type: DataTypes.DOUBLE
			},
			"P3a-47_Spt_TotQty_BY1Base": {
				type: DataTypes.DOUBLE
			},
			"P3a-48_GWSCUC_CY": {
				type: DataTypes.DOUBLE
			},
			"P3a-49_GWSCUC_BY1Base": {
				type: DataTypes.DOUBLE
			},
			"P3a-49_InstPY_APYQty": {
				type: DataTypes.DOUBLE
			},
			"P3a-49_Spt_TotQty_BY1": {
				type: DataTypes.DOUBLE
			},
			"P3a-50_InstPY_PYQty": {
				type: DataTypes.DOUBLE
			},
			"P3a-50_LessPYAP_BY1Base": {
				type: DataTypes.DOUBLE
			},
			"P3a-51_GWSCUC_BY1": {
				type: DataTypes.DOUBLE
			},
			"P3a-51_InstPY_CYQty": {
				type: DataTypes.DOUBLE
			},
			"P3a-52_InstPY_BY1BaseQty": {
				type: DataTypes.DOUBLE
			},
			"P3a-52_LessPYAP_BY1": {
				type: DataTypes.DOUBLE
			},
			"P3a-53_InstPY_BY1OCOQty": {
				type: DataTypes.DOUBLE
			},
			"P3a-54_InstPY_BY1Qty": {
				type: DataTypes.DOUBLE
			},
			"P3a-56_Spt_TotCost_APY": {
				type: DataTypes.DOUBLE
			},
			"P3a-57_Spt_TotCost_PY": {
				type: DataTypes.DOUBLE
			},
			"P3a-58_Spt_TotCost_CY": {
				type: DataTypes.DOUBLE
			},
			"P3a-59_NetP1_APY": {
				type: DataTypes.DOUBLE
			},
			"P3a-59_Spt_TotCost_BY1Base": {
				type: DataTypes.DOUBLE
			},
			"P3a-60_NetP1_PY": {
				type: DataTypes.DOUBLE
			},
			"P3a-61_InstPY_APYCost": {
				type: DataTypes.DOUBLE
			},
			"P3a-61_NetP1_CY": {
				type: DataTypes.DOUBLE
			},
			"P3a-61_Spt_TotCost_BY1": {
				type: DataTypes.DOUBLE
			},
			"P3a-62_InstPY_PYCost": {
				type: DataTypes.DOUBLE
			},
			"P3a-62_NetP1_BY1Base": {
				type: DataTypes.DOUBLE
			},
			"P3a-63_InstPY_CYCost": {
				type: DataTypes.DOUBLE
			},
			"P3a-63_NetP1_BY1OCO": {
				type: DataTypes.DOUBLE
			},
			"P3a-64_InstPY_BY1BaseCost": {
				type: DataTypes.DOUBLE
			},
			"P3a-64_NetP1_BY1": {
				type: DataTypes.DOUBLE
			},
			"P3a-65_InstPY_BY1OCOCost": {
				type: DataTypes.DOUBLE
			},
			"P3a-66_InstPY_BY1Cost": {
				type: DataTypes.DOUBLE
			},
			"P3a-71_PlusCYAP_APY": {
				type: DataTypes.DOUBLE
			},
			"P3a-72_PlusCYAP_PY": {
				type: DataTypes.DOUBLE
			},
			"P3a-73_InstCY_APYQty": {
				type: DataTypes.DOUBLE
			},
			"P3a-73_PlusCYAP_CY": {
				type: DataTypes.DOUBLE
			},
			"P3a-74_InstCY_PYQty": {
				type: DataTypes.DOUBLE
			},
			"P3a-74_PlusCYAP_BY1Base": {
				type: DataTypes.DOUBLE
			},
			"P3a-75_InstCY_CYQty": {
				type: DataTypes.DOUBLE
			},
			"P3a-76_InstCY_BY1BaseQty": {
				type: DataTypes.DOUBLE
			},
			"P3a-76_PlusCYAP_BY1": {
				type: DataTypes.DOUBLE
			},
			"P3a-77_InstCY_BY1OCOQty": {
				type: DataTypes.DOUBLE
			},
			"P3a-78_InstCY_BY1Qty": {
				type: DataTypes.DOUBLE
			},
			"P3a-83_TOA_APY": {
				type: DataTypes.DOUBLE
			},
			"P3a-84_TOA_PY": {
				type: DataTypes.DOUBLE
			},
			"P3a-85_InstCY_APYCost": {
				type: DataTypes.DOUBLE
			},
			"P3a-85_TOA_CY": {
				type: DataTypes.DOUBLE
			},
			"P3a-86_InstCY_PYCost": {
				type: DataTypes.DOUBLE
			},
			"P3a-86_TOA_BY1Base": {
				type: DataTypes.DOUBLE
			},
			"P3a-87_InstCY_CYCost": {
				type: DataTypes.DOUBLE
			},
			"P3a-87_TOA_BY1OCO": {
				type: DataTypes.DOUBLE
			},
			"P3a-88_InstCY_BY1BaseCost": {
				type: DataTypes.DOUBLE
			},
			"P3a-88_TOA_BY1": {
				type: DataTypes.DOUBLE
			},
			"P3a-89_InstCY_BY1OCOCost": {
				type: DataTypes.DOUBLE
			},
			"P3a-90_InstCY_BY1Cost": {
				type: DataTypes.DOUBLE
			},
			"P40-01_LI_Number": {
				type: DataTypes.TEXT
			},
			"P40-02_LI_Title": {
				type: DataTypes.TEXT
			},
			"P40-03_P1_LineNumber": {
				type: DataTypes.TEXT
			},
			"P40-04_BudgetYear": {
				type: DataTypes.TEXT
			},
			"P40-05_BudgetCycle": {
				type: DataTypes.TEXT
			},
			"P40-06_Organization": {
				type: DataTypes.TEXT
			},
			"P40-07_Org_Code": {
				type: DataTypes.TEXT
			},
			"P40-08_Appn_Number": {
				type: DataTypes.TEXT
			},
			"P40-09_Appn_Title": {
				type: DataTypes.TEXT
			},
			"P40-10_BA_Number": {
				type: DataTypes.TEXT
			},
			"P40-11_BA_Title": {
				type: DataTypes.TEXT
			},
			"P40-12_BSA_Number": {
				type: DataTypes.DOUBLE
			},
			"P40-13_BSA_Title": {
				type: DataTypes.TEXT
			},
			"P40-14_IDCode": {
				type: DataTypes.TEXT
			},
			"P40-15_MDAPCode": {
				type: DataTypes.TEXT
			},
			"P40-16_CodeB_PE": {
				type: DataTypes.TEXT
			},
			"P40-16_InSpares_APY": {
				type: DataTypes.DOUBLE
			},
			"P40-16_OthEntry_Name": {
				type: DataTypes.TEXT
			},
			"P40-16_OthRel_PE": {
				type: DataTypes.TEXT
			},
			"P40-16_ProcQty_APY": {
				type: DataTypes.DOUBLE
			},
			"P40-16_SecDist_Comp_Name": {
				type: DataTypes.TEXT
			},
			"P40-17_InSpares_PY": {
				type: DataTypes.DOUBLE
			},
			"P40-17_OthEntry_APY": {
				type: DataTypes.DOUBLE
			},
			"P40-17_ProcQty_PY": {
				type: DataTypes.DOUBLE
			},
			"P40-17_SecDist_CompQty_PY": {
				type: DataTypes.DOUBLE
			},
			"P40-18_InSpares_CY": {
				type: DataTypes.DOUBLE
			},
			"P40-18_OthEntry_PY": {
				type: DataTypes.DOUBLE
			},
			"P40-18_ProcQty_CY": {
				type: DataTypes.DOUBLE
			},
			"P40-18_SecDist_CompQty_CY": {
				type: DataTypes.DOUBLE
			},
			"P40-19_InSpares_BY1Base": {
				type: DataTypes.DOUBLE
			},
			"P40-19_OthEntry_CY": {
				type: DataTypes.DOUBLE
			},
			"P40-19_ProcQty_BY1Base": {
				type: DataTypes.DOUBLE
			},
			"P40-19_SecDist_CompQty_BY1Base": {
				type: DataTypes.DOUBLE
			},
			"P40-20_OthEntry_BY1Base": {
				type: DataTypes.DOUBLE
			},
			"P40-20_SecDist_CompQty_BY1OCO": {
				type: DataTypes.DOUBLE
			},
			"P40-21_InSpares_BY1": {
				type: DataTypes.DOUBLE
			},
			"P40-21_ProcQty_BY1": {
				type: DataTypes.DOUBLE
			},
			"P40-21_SecDist_CompQty_BY1": {
				type: DataTypes.DOUBLE
			},
			"P40-22_OthEntry_BY1": {
				type: DataTypes.DOUBLE
			},
			"P40-26_OYDelta_Cost_TC": {
				type: DataTypes.DOUBLE
			},
			"P40-26_SecDist_CompTOA_PY": {
				type: DataTypes.DOUBLE
			},
			"P40-27_OYDelta_Cost_TOT": {
				type: DataTypes.DOUBLE
			},
			"P40-27_SecDist_CompTOA_CY": {
				type: DataTypes.DOUBLE
			},
			"P40-28_APYDelta_Qty": {
				type: DataTypes.DOUBLE
			},
			"P40-28_FlyUC_APY": {
				type: DataTypes.DOUBLE
			},
			"P40-28_GWSC_APY": {
				type: DataTypes.DOUBLE
			},
			"P40-28_SecDist_CompTOA_BY1Base": {
				type: DataTypes.DOUBLE
			},
			"P40-29_APYDelta_Cost": {
				type: DataTypes.DOUBLE
			},
			"P40-29_FlyUC_PY": {
				type: DataTypes.DOUBLE
			},
			"P40-29_GWSC_PY": {
				type: DataTypes.DOUBLE
			},
			"P40-29_SecDist_CompTOA_BY1OCO": {
				type: DataTypes.DOUBLE
			},
			"P40-30_FlyUC_CY": {
				type: DataTypes.DOUBLE
			},
			"P40-30_GWSC_CY": {
				type: DataTypes.DOUBLE
			},
			"P40-30_SecDist_CompTOA_BY1": {
				type: DataTypes.DOUBLE
			},
			"P40-31_FlyUC_BY1Base": {
				type: DataTypes.DOUBLE
			},
			"P40-31_GWSC_BY1Base": {
				type: DataTypes.DOUBLE
			},
			"P40-32_GWSC_BY1OCO": {
				type: DataTypes.DOUBLE
			},
			"P40-33_FlyUC_BY1": {
				type: DataTypes.DOUBLE
			},
			"P40-33_GWSC_BY1": {
				type: DataTypes.DOUBLE
			},
			"P40-35_SecDist_TotalQty_PY": {
				type: DataTypes.DOUBLE
			},
			"P40-36_SecDist_TotalQty_CY": {
				type: DataTypes.DOUBLE
			},
			"P40-37_SecDist_TotalQty_BY1Base": {
				type: DataTypes.DOUBLE
			},
			"P40-38_SecDist_TotalQty_BY1OCO": {
				type: DataTypes.DOUBLE
			},
			"P40-39_FlyUC_TOT": {
				type: DataTypes.DOUBLE
			},
			"P40-39_GWSC_TOT": {
				type: DataTypes.DOUBLE
			},
			"P40-39_SecDist_TotalQty_BY1": {
				type: DataTypes.DOUBLE
			},
			"P40-40_GWSCUC_APY": {
				type: DataTypes.DOUBLE
			},
			"P40-40_LessPYAP_APY": {
				type: DataTypes.DOUBLE
			},
			"P40-41_GWSCUC_PY": {
				type: DataTypes.DOUBLE
			},
			"P40-41_LessPYAP_PY": {
				type: DataTypes.DOUBLE
			},
			"P40-42_GWSCUC_CY": {
				type: DataTypes.DOUBLE
			},
			"P40-42_LessPYAP_CY": {
				type: DataTypes.DOUBLE
			},
			"P40-43_GWSCUC_BY1Base": {
				type: DataTypes.DOUBLE
			},
			"P40-43_LessPYAP_BY1Base": {
				type: DataTypes.DOUBLE
			},
			"P40-44_SecDist_TotalTOA_PY": {
				type: DataTypes.DOUBLE
			},
			"P40-45_GWSCUC_BY1": {
				type: DataTypes.DOUBLE
			},
			"P40-45_LessPYAP_BY1": {
				type: DataTypes.DOUBLE
			},
			"P40-45_SecDist_TotalTOA_CY": {
				type: DataTypes.DOUBLE
			},
			"P40-46_SecDist_TotalTOA_BY1Base": {
				type: DataTypes.DOUBLE
			},
			"P40-47_SecDist_TotalTOA_BY1OCO": {
				type: DataTypes.DOUBLE
			},
			"P40-48_SecDist_TotalTOA_BY1": {
				type: DataTypes.DOUBLE
			},
			"P40-52_NetP1_APY": {
				type: DataTypes.DOUBLE
			},
			"P40-53_NetP1_PY": {
				type: DataTypes.DOUBLE
			},
			"P40-54_NetP1_CY": {
				type: DataTypes.DOUBLE
			},
			"P40-55_NetP1_BY1Base": {
				type: DataTypes.DOUBLE
			},
			"P40-56_NetP1_BY1OCO": {
				type: DataTypes.DOUBLE
			},
			"P40-57_NetP1_BY1": {
				type: DataTypes.DOUBLE
			},
			"P40-63_NetP1_TOT": {
				type: DataTypes.DOUBLE
			},
			"P40-64_PlusCYAP_APY": {
				type: DataTypes.DOUBLE
			},
			"P40-65_PlusCYAP_PY": {
				type: DataTypes.DOUBLE
			},
			"P40-66_PlusCYAP_CY": {
				type: DataTypes.DOUBLE
			},
			"P40-67_PlusCYAP_BY1Base": {
				type: DataTypes.DOUBLE
			},
			"P40-69_PlusCYAP_BY1": {
				type: DataTypes.DOUBLE
			},
			"P40-76_TOA_APY": {
				type: DataTypes.DOUBLE
			},
			"P40-77_TOA_PY": {
				type: DataTypes.DOUBLE
			},
			"P40-78_TOA_CY": {
				type: DataTypes.DOUBLE
			},
			"P40-79_TOA_BY1Base": {
				type: DataTypes.DOUBLE
			},
			"P40-80_TOA_BY1OCO": {
				type: DataTypes.DOUBLE
			},
			"P40-81_TOA_BY1": {
				type: DataTypes.DOUBLE
			},
			"P40-87_TOA_TOT": {
				type: DataTypes.DOUBLE
			},
			"P40a-14_Title": {
				type: DataTypes.TEXT
			},
			"P40a-15_Category_Name": {
				type: DataTypes.TEXT
			},
			"P40a-16_Item_Name": {
				type: DataTypes.TEXT
			},
			"P40a-16_Title": {
				type: DataTypes.TEXT
			},
			"P40a-17_Category_Name": {
				type: DataTypes.TEXT
			},
			"P40a-17_Item_ItemNumber": {
				type: DataTypes.TEXT
			},
			"P40a-18_Item_IDCode": {
				type: DataTypes.TEXT
			},
			"P40a-18_Item_Name": {
				type: DataTypes.TEXT
			},
			"P40a-19_Item_ItemNumber": {
				type: DataTypes.TEXT
			},
			"P40a-20_Item_IDCode": {
				type: DataTypes.TEXT
			},
			"P40a-20_SecDist_Comp_Name": {
				type: DataTypes.TEXT
			},
			"P40a-21_SecDist_CompQty_PY": {
				type: DataTypes.DOUBLE
			},
			"P40a-22_SecDist_CompQty_CY": {
				type: DataTypes.DOUBLE
			},
			"P40a-23_Item_ModType": {
				type: DataTypes.TEXT
			},
			"P40a-23_SecDist_CompQty_BY1Base": {
				type: DataTypes.DOUBLE
			},
			"P40a-24_Item_ModelAff": {
				type: DataTypes.TEXT
			},
			"P40a-25_ItemQty_APY": {
				type: DataTypes.DOUBLE
			},
			"P40a-25_SecDist_CompQty_BY1": {
				type: DataTypes.DOUBLE
			},
			"P40a-26_ItemQty_PY": {
				type: DataTypes.DOUBLE
			},
			"P40a-27_ItemQty_CY": {
				type: DataTypes.DOUBLE
			},
			"P40a-28_ItemQty_BY1Base": {
				type: DataTypes.DOUBLE
			},
			"P40a-30_ItemQty_BY1": {
				type: DataTypes.DOUBLE
			},
			"P40a-30_SecDist_CompCost_PY": {
				type: DataTypes.DOUBLE
			},
			"P40a-31_SecDist_CompCost_CY": {
				type: DataTypes.DOUBLE
			},
			"P40a-32_SecDist_CompCost_BY1Base": {
				type: DataTypes.DOUBLE
			},
			"P40a-33_SecDist_CompCost_BY1OCO": {
				type: DataTypes.DOUBLE
			},
			"P40a-34_SecDist_CompCost_BY1": {
				type: DataTypes.DOUBLE
			},
			"P40a-37_ItemCost_APY": {
				type: DataTypes.DOUBLE
			},
			"P40a-38_ItemCost_PY": {
				type: DataTypes.DOUBLE
			},
			"P40a-39_ItemCost_CY": {
				type: DataTypes.DOUBLE
			},
			"P40a-40_ItemCost_BY1Base": {
				type: DataTypes.DOUBLE
			},
			"P40a-41_ItemCost_BY1OCO": {
				type: DataTypes.DOUBLE
			},
			"P40a-42_ItemCost_BY1": {
				type: DataTypes.DOUBLE
			},
			"P40a-49_ItemUC_APY": {
				type: DataTypes.DOUBLE
			},
			"P40a-50_ItemUC_PY": {
				type: DataTypes.DOUBLE
			},
			"P40a-51_ItemUC_CY": {
				type: DataTypes.DOUBLE
			},
			"P40a-52_ItemUC_BY1Base": {
				type: DataTypes.DOUBLE
			},
			"P40a-54_ItemUC_BY1": {
				type: DataTypes.DOUBLE
			},
			"P40a-61_CatSubTotCost_APY": {
				type: DataTypes.DOUBLE
			},
			"P40a-62_CatSubTotCost_PY": {
				type: DataTypes.DOUBLE
			},
			"P40a-63_CatSubTotCost_CY": {
				type: DataTypes.DOUBLE
			},
			"P40a-64_CatSubTotCost_BY1Base": {
				type: DataTypes.DOUBLE
			},
			"P40a-65_CatSubTotCost_BY1OCO": {
				type: DataTypes.DOUBLE
			},
			"P40a-66_CatSubTotCost_BY1": {
				type: DataTypes.DOUBLE
			},
			"P40a-73_TotCost_APY": {
				type: DataTypes.DOUBLE
			},
			"P40a-74_TotCost_PY": {
				type: DataTypes.DOUBLE
			},
			"P40a-75_TotCost_CY": {
				type: DataTypes.DOUBLE
			},
			"P40a-76_TotCost_BY1Base": {
				type: DataTypes.DOUBLE
			},
			"P40a-77_TotCost_BY1OCO": {
				type: DataTypes.DOUBLE
			},
			"P5-14_Item_Title": {
				type: DataTypes.TEXT
			},
			"P5-15_Item_ItemNumber": {
				type: DataTypes.TEXT
			},
			"P5-16_Item_IDCode": {
				type: DataTypes.TEXT
			},
			"P5-16_Item_Title": {
				type: DataTypes.TEXT
			},
			"P5-16_SecDist_Comp_Name": {
				type: DataTypes.TEXT
			},
			"P5-17_Item_ItemNumber": {
				type: DataTypes.TEXT
			},
			"P5-17_Item_MDAPCode": {
				type: DataTypes.TEXT
			},
			"P5-17_SecDist_CompQty_PY": {
				type: DataTypes.DOUBLE
			},
			"P5-18_CECat_Name": {
				type: DataTypes.TEXT
			},
			"P5-18_Item_IDCode": {
				type: DataTypes.TEXT
			},
			"P5-18_SecDist_CompQty_CY": {
				type: DataTypes.DOUBLE
			},
			"P5-19_CECat_Type": {
				type: DataTypes.TEXT
			},
			"P5-19_Item_MDAPCode": {
				type: DataTypes.TEXT
			},
			"P5-19_SecDist_CompQty_BY1Base": {
				type: DataTypes.DOUBLE
			},
			"P5-20_CE_Name": {
				type: DataTypes.TEXT
			},
			"P5-20_InSpares_APY": {
				type: DataTypes.DOUBLE
			},
			"P5-21_CEQty_APY": {
				type: DataTypes.DOUBLE
			},
			"P5-21_InSpares_PY": {
				type: DataTypes.DOUBLE
			},
			"P5-21_SecDist_CompQty_BY1": {
				type: DataTypes.DOUBLE
			},
			"P5-22_CEQty_PY": {
				type: DataTypes.DOUBLE
			},
			"P5-22_InSpares_CY": {
				type: DataTypes.DOUBLE
			},
			"P5-22_ProcQty_APY": {
				type: DataTypes.DOUBLE
			},
			"P5-23_CEQty_CY": {
				type: DataTypes.DOUBLE
			},
			"P5-23_InSpares_BY1Base": {
				type: DataTypes.DOUBLE
			},
			"P5-23_ProcQty_PY": {
				type: DataTypes.DOUBLE
			},
			"P5-24_CEQty_BY1Base": {
				type: DataTypes.DOUBLE
			},
			"P5-24_InSpares_BY1OCO": {
				type: DataTypes.DOUBLE
			},
			"P5-24_ProcQty_CY": {
				type: DataTypes.DOUBLE
			},
			"P5-25_InSpares_BY1": {
				type: DataTypes.DOUBLE
			},
			"P5-25_ProcQty_BY1Base": {
				type: DataTypes.DOUBLE
			},
			"P5-26_CEQty_BY1": {
				type: DataTypes.DOUBLE
			},
			"P5-26_SecDist_CompTOA_PY": {
				type: DataTypes.DOUBLE
			},
			"P5-27_ProcQty_BY1": {
				type: DataTypes.DOUBLE
			},
			"P5-27_SecDist_CompTOA_CY": {
				type: DataTypes.DOUBLE
			},
			"P5-28_SecDist_CompTOA_BY1Base": {
				type: DataTypes.DOUBLE
			},
			"P5-30_SecDist_CompTOA_BY1": {
				type: DataTypes.DOUBLE
			},
			"P5-32_GWSCUC_APY": {
				type: DataTypes.DOUBLE
			},
			"P5-33_CECost_APY": {
				type: DataTypes.DOUBLE
			},
			"P5-33_GWSCUC_PY": {
				type: DataTypes.DOUBLE
			},
			"P5-34_CECost_PY": {
				type: DataTypes.DOUBLE
			},
			"P5-34_GWSC_APY": {
				type: DataTypes.DOUBLE
			},
			"P5-34_GWSCUC_CY": {
				type: DataTypes.DOUBLE
			},
			"P5-35_CECost_CY": {
				type: DataTypes.DOUBLE
			},
			"P5-35_GWSC_PY": {
				type: DataTypes.DOUBLE
			},
			"P5-35_GWSCUC_BY1Base": {
				type: DataTypes.DOUBLE
			},
			"P5-36_CECost_BY1Base": {
				type: DataTypes.DOUBLE
			},
			"P5-36_GWSC_CY": {
				type: DataTypes.DOUBLE
			},
			"P5-37_CECost_BY1OCO": {
				type: DataTypes.DOUBLE
			},
			"P5-37_GWSC_BY1Base": {
				type: DataTypes.DOUBLE
			},
			"P5-37_GWSCUC_BY1": {
				type: DataTypes.DOUBLE
			},
			"P5-38_CECost_BY1": {
				type: DataTypes.DOUBLE
			},
			"P5-38_GWSC_BY1OCO": {
				type: DataTypes.DOUBLE
			},
			"P5-39_GWSC_BY1": {
				type: DataTypes.DOUBLE
			},
			"P5-45_CEUC_APY": {
				type: DataTypes.DOUBLE
			},
			"P5-46_CEUC_PY": {
				type: DataTypes.DOUBLE
			},
			"P5-46_LessPYAP_APY": {
				type: DataTypes.DOUBLE
			},
			"P5-47_CEUC_CY": {
				type: DataTypes.DOUBLE
			},
			"P5-47_LessPYAP_PY": {
				type: DataTypes.DOUBLE
			},
			"P5-48_CEUC_BY1Base": {
				type: DataTypes.DOUBLE
			},
			"P5-48_LessPYAP_CY": {
				type: DataTypes.DOUBLE
			},
			"P5-49_LessPYAP_BY1Base": {
				type: DataTypes.DOUBLE
			},
			"P5-50_CEUC_BY1": {
				type: DataTypes.DOUBLE
			},
			"P5-51_LessPYAP_BY1": {
				type: DataTypes.DOUBLE
			},
			"P5-57_CECat_Type_TotCost_APY": {
				type: DataTypes.DOUBLE
			},
			"P5-58_CECat_Type_TotCost_PY": {
				type: DataTypes.DOUBLE
			},
			"P5-58_NetP1_APY": {
				type: DataTypes.DOUBLE
			},
			"P5-59_CECat_Type_TotCost_CY": {
				type: DataTypes.DOUBLE
			},
			"P5-59_NetP1_PY": {
				type: DataTypes.DOUBLE
			},
			"P5-60_CECat_Type_TotCost_BY1Base": {
				type: DataTypes.DOUBLE
			},
			"P5-60_NetP1_CY": {
				type: DataTypes.DOUBLE
			},
			"P5-61_CECat_Type_TotCost_BY1OCO": {
				type: DataTypes.DOUBLE
			},
			"P5-61_NetP1_BY1Base": {
				type: DataTypes.DOUBLE
			},
			"P5-62_CECat_Type_TotCost_BY1": {
				type: DataTypes.DOUBLE
			},
			"P5-62_NetP1_BY1OCO": {
				type: DataTypes.DOUBLE
			},
			"P5-63_NetP1_BY1": {
				type: DataTypes.DOUBLE
			},
			"P5-69_CECat_TotCost_APY": {
				type: DataTypes.DOUBLE
			},
			"P5-70_CECat_TotCost_PY": {
				type: DataTypes.DOUBLE
			},
			"P5-70_PlusCYAP_APY": {
				type: DataTypes.DOUBLE
			},
			"P5-71_CECat_TotCost_CY": {
				type: DataTypes.DOUBLE
			},
			"P5-71_PlusCYAP_PY": {
				type: DataTypes.DOUBLE
			},
			"P5-72_CECat_TotCost_BY1Base": {
				type: DataTypes.DOUBLE
			},
			"P5-72_PlusCYAP_CY": {
				type: DataTypes.DOUBLE
			},
			"P5-73_CECat_TotCost_BY1OCO": {
				type: DataTypes.DOUBLE
			},
			"P5-73_PlusCYAP_BY1Base": {
				type: DataTypes.DOUBLE
			},
			"P5-74_CECat_TotCost_BY1": {
				type: DataTypes.DOUBLE
			},
			"P5-75_PlusCYAP_BY1": {
				type: DataTypes.DOUBLE
			},
			"P5-82_TOA_APY": {
				type: DataTypes.DOUBLE
			},
			"P5-83_TOA_PY": {
				type: DataTypes.DOUBLE
			},
			"P5-84_TOA_CY": {
				type: DataTypes.DOUBLE
			},
			"P5-85_TOA_BY1Base": {
				type: DataTypes.DOUBLE
			},
			"P5-86_TOA_BY1OCO": {
				type: DataTypes.DOUBLE
			},
			"P5-87_TOA_BY1": {
				type: DataTypes.DOUBLE
			},
			"P40-14_Description": {
				type: DataTypes.TEXT
			},
			"P40-15_Justification": {
				type: DataTypes.TEXT
			},
			"P3a-22_Kit_Name": {
				type: DataTypes.TEXT
			},
			"P3a-23_KitQty_APY": {
				type: DataTypes.TEXT
			},
			"P3a-24_KitQty_PY": {
				type: DataTypes.TEXT
			},
			
			
			"P40-14_Description_Search": {
				type: DataTypes.TSVECTOR
			},
			"P40-15_Justification_Search": {
				type: DataTypes.TSVECTOR
			},
		}, {
		freezeTableName: true,
		timestamps: false,
		tableName: 'pdoc'
	}
	);
	return PDOC;
};
