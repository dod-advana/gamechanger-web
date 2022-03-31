'use strict';

const tablename = 'pdoc';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		return queryInterface.sequelize.transaction(function () {
			Promise.all([
				queryInterface.addColumn(tablename, 'filename', Sequelize.TEXT),
				queryInterface.addColumn(tablename, 'P3a-146_InstBY1_APYQty', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P3a-148_InstBY1_CYQty', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P3a-149_InstBY1_BY1BaseQty', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P3a-150_InstBY1_BY1OCOQty', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P3a-151_InstBY1_BY1Qty', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P3a-158_InstBY1_APYCost', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P3a-160_InstBY1_CYCost', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P3a-161_InstBY1_BY1BaseCost', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P3a-162_InstBY1_BY1OCOCost', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P3a-163_InstBY1_BY1Cost', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P3a-173_InstBY2_BY1BaseQty', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P3a-174_InstBY2_BY1OCOQty', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P3a-175_InstBY2_BY1Qty', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P3a-185_InstBY2_BY1BaseCost', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P3a-186_InstBY2_BY1OCOCost', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P3a-187_InstBY2_BY1Cost', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P3a-197_InstBY3_BY1BaseQty', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P3a-199_InstBY3_BY1Qty', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P3a-209_InstBY3_BY1BaseCost', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P3a-21_NonOrgInst_Name', Sequelize.TEXT),
				queryInterface.addColumn(tablename, 'P3a-211_InstBY3_BY1Cost', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P3a-23_OrgInst_Name', Sequelize.TEXT),
				queryInterface.addColumn(tablename, 'P3a-24_OrgInst_Qty', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P3a-25_InstAPY_APYQty', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P3a-25_OthEntry_BY1Base', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P3a-26_InstAPY_PYQty', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P3a-27_InstAPY_CYQty', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P3a-28_InstAPY_BY1BaseQty', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P3a-29_InstAPY_BY1OCOQty', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P3a-290_InstTOT_APYQty', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P3a-291_InstTOT_PYQty', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P3a-292_InstTOT_CYQty', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P3a-293_InstTOT_BY1BaseQty', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P3a-294_InstTOT_BY1OCOQty', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P3a-295_InstTOT_BY1Qty', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P3a-30_InstAPY_BY1Qty', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P3a-302_InstTOT_APYCost', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P3a-303_InstTOT_PYCost', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P3a-304_InstTOT_CYCost', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P3a-305_InstTOT_BY1BaseCost', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P3a-306_InstTOT_BY1OCOCost', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P3a-307_InstTOT_BY1Cost', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P3a-314_Inst_SubTotQty_APY', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P3a-315_Inst_SubTotQty_PY', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P3a-316_Inst_SubTotQty_CY', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P3a-317_Inst_SubTotQty_BY1Base', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P3a-319_Inst_SubTotQty_BY1', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P3a-326_Inst_SubTotCost_APY', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P3a-327_Inst_SubTotCost_PY', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P3a-328_Inst_SubTotCost_CY', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P3a-329_Inst_SubTotCost_BY1Base', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P3a-331_Inst_SubTotCost_BY1', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P3a-35_GWSC_APY', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P3a-36_ModItem_PEFundCost_BY1Base', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P3a-37_InstAPY_APYCost', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P3a-38_InstAPY_PYCost', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P3a-39_InstAPY_CYCost', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P3a-40_InstAPY_BY1BaseCost', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P3a-41_InstAPY_BY1OCOCost', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P3a-42_InstAPY_BY1Cost', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P3a-49_InstPY_APYQty', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P3a-50_InstPY_PYQty', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P3a-51_InstPY_CYQty', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P3a-52_InstPY_BY1BaseQty', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P3a-53_InstPY_BY1OCOQty', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P3a-54_InstPY_BY1Qty', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P3a-61_InstPY_APYCost', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P3a-62_InstPY_PYCost', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P3a-63_InstPY_CYCost', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P3a-64_InstPY_BY1BaseCost', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P3a-65_InstPY_BY1OCOCost', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P3a-66_InstPY_BY1Cost', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P3a-73_InstCY_APYQty', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P3a-74_InstCY_PYQty', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P3a-75_InstCY_CYQty', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P3a-76_InstCY_BY1BaseQty', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P3a-77_InstCY_BY1OCOQty', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P3a-78_InstCY_BY1Qty', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P3a-85_InstCY_APYCost', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P3a-86_InstCY_PYCost', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P3a-87_InstCY_CYCost', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P3a-88_InstCY_BY1BaseCost', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P3a-89_InstCY_BY1OCOCost', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P3a-90_InstCY_BY1Cost', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P40-16_CodeB_PE', Sequelize.TEXT),
				queryInterface.addColumn(tablename, 'P40-16_InSpares_APY', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P40-16_ProcQty_APY', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P40-16_SecDist_Comp_Name', Sequelize.TEXT),
				queryInterface.addColumn(tablename, 'P40-17_InSpares_PY', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P40-17_ProcQty_PY', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P40-17_SecDist_CompQty_PY', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P40-18_InSpares_CY', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P40-18_ProcQty_CY', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P40-18_SecDist_CompQty_CY', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P40-19_InSpares_BY1Base', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P40-19_OthEntry_CY', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P40-19_ProcQty_BY1Base', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P40-19_SecDist_CompQty_BY1Base', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P40-20_SecDist_CompQty_BY1OCO', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P40-21_InSpares_BY1', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P40-21_ProcQty_BY1', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P40-21_SecDist_CompQty_BY1', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P40-26_SecDist_CompTOA_PY', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P40-27_SecDist_CompTOA_CY', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P40-28_FlyUC_APY', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P40-28_GWSC_APY', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P40-28_SecDist_CompTOA_BY1Base', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P40-29_FlyUC_PY', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P40-29_GWSC_PY', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P40-29_SecDist_CompTOA_BY1OCO', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P40-30_FlyUC_CY', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P40-30_GWSC_CY', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P40-30_SecDist_CompTOA_BY1', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P40-31_FlyUC_BY1Base', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P40-31_GWSC_BY1Base', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P40-32_GWSC_BY1OCO', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P40-33_FlyUC_BY1', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P40-33_GWSC_BY1', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P40-35_SecDist_TotalQty_PY', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P40-36_SecDist_TotalQty_CY', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P40-37_SecDist_TotalQty_BY1Base', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P40-38_SecDist_TotalQty_BY1OCO', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P40-39_FlyUC_TOT', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P40-39_GWSC_TOT', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P40-39_SecDist_TotalQty_BY1', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P40-40_GWSCUC_APY', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P40-40_LessPYAP_APY', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P40-41_GWSCUC_PY', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P40-41_LessPYAP_PY', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P40-42_GWSCUC_CY', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P40-42_LessPYAP_CY', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P40-43_GWSCUC_BY1Base', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P40-43_LessPYAP_BY1Base', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P40-44_SecDist_TotalTOA_PY', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P40-45_GWSCUC_BY1', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P40-45_LessPYAP_BY1', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P40-45_SecDist_TotalTOA_CY', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P40-46_SecDist_TotalTOA_BY1Base', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P40-47_SecDist_TotalTOA_BY1OCO', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P40-48_SecDist_TotalTOA_BY1', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P40-52_NetP1_APY', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P40-53_NetP1_PY', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P40-54_NetP1_CY', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P40-55_NetP1_BY1Base', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P40-56_NetP1_BY1OCO', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P40-57_NetP1_BY1', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P40-63_NetP1_TOT', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P40-64_PlusCYAP_APY', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P40-65_PlusCYAP_PY', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P40-66_PlusCYAP_CY', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P40-67_PlusCYAP_BY1Base', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P40-69_PlusCYAP_BY1', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P40-76_TOA_APY', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P40-77_TOA_PY', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P40-78_TOA_CY', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P40-79_TOA_BY1Base', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P40-80_TOA_BY1OCO', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P40-81_TOA_BY1', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P40-87_TOA_TOT', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P40a-14_Title', Sequelize.TEXT),
				queryInterface.addColumn(tablename, 'P40a-15_Category_Name', Sequelize.TEXT),
				queryInterface.addColumn(tablename, 'P40a-16_Item_Name', Sequelize.TEXT),
				queryInterface.addColumn(tablename, 'P40a-16_Title', Sequelize.TEXT),
				queryInterface.addColumn(tablename, 'P40a-17_Category_Name', Sequelize.TEXT),
				queryInterface.addColumn(tablename, 'P40a-17_Item_ItemNumber', Sequelize.TEXT),
				queryInterface.addColumn(tablename, 'P40a-18_Item_IDCode', Sequelize.TEXT),
				queryInterface.addColumn(tablename, 'P40a-18_Item_Name', Sequelize.TEXT),
				queryInterface.addColumn(tablename, 'P40a-19_Item_ItemNumber', Sequelize.TEXT),
				queryInterface.addColumn(tablename, 'P40a-20_Item_IDCode', Sequelize.TEXT),
				queryInterface.addColumn(tablename, 'P40a-20_SecDist_Comp_Name', Sequelize.TEXT),
				queryInterface.addColumn(tablename, 'P40a-21_SecDist_CompQty_PY', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P40a-22_SecDist_CompQty_CY', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P40a-23_Item_ModType', Sequelize.TEXT),
				queryInterface.addColumn(tablename, 'P40a-23_SecDist_CompQty_BY1Base', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P40a-24_Item_ModelAff', Sequelize.TEXT),
				queryInterface.addColumn(tablename, 'P40a-25_ItemQty_APY', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P40a-25_SecDist_CompQty_BY1', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P40a-26_ItemQty_PY', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P40a-27_ItemQty_CY', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P40a-28_ItemQty_BY1Base', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P40a-30_ItemQty_BY1', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P40a-30_SecDist_CompCost_PY', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P40a-31_SecDist_CompCost_CY', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P40a-32_SecDist_CompCost_BY1Base', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P40a-33_SecDist_CompCost_BY1OCO', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P40a-34_SecDist_CompCost_BY1', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P40a-37_ItemCost_APY', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P40a-38_ItemCost_PY', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P40a-39_ItemCost_CY', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P40a-40_ItemCost_BY1Base', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P40a-41_ItemCost_BY1OCO', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P40a-42_ItemCost_BY1', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P40a-49_ItemUC_APY', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P40a-50_ItemUC_PY', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P40a-51_ItemUC_CY', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P40a-52_ItemUC_BY1Base', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P40a-54_ItemUC_BY1', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P40a-61_CatSubTotCost_APY', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P40a-62_CatSubTotCost_PY', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P40a-63_CatSubTotCost_CY', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P40a-64_CatSubTotCost_BY1Base', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P40a-65_CatSubTotCost_BY1OCO', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P40a-66_CatSubTotCost_BY1', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P40a-73_TotCost_APY', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P40a-74_TotCost_PY', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P40a-75_TotCost_CY', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P40a-76_TotCost_BY1Base', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P40a-77_TotCost_BY1OCO', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P5-14_Item_Title', Sequelize.TEXT),
				queryInterface.addColumn(tablename, 'P5-15_Item_ItemNumber', Sequelize.TEXT),
				queryInterface.addColumn(tablename, 'P5-16_Item_IDCode', Sequelize.TEXT),
				queryInterface.addColumn(tablename, 'P5-16_Item_Title', Sequelize.TEXT),
				queryInterface.addColumn(tablename, 'P5-16_SecDist_Comp_Name', Sequelize.TEXT),
				queryInterface.addColumn(tablename, 'P5-17_Item_ItemNumber', Sequelize.TEXT),
				queryInterface.addColumn(tablename, 'P5-17_Item_MDAPCode', Sequelize.TEXT),
				queryInterface.addColumn(tablename, 'P5-17_SecDist_CompQty_PY', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P5-18_CECat_Name', Sequelize.TEXT),
				queryInterface.addColumn(tablename, 'P5-18_Item_IDCode', Sequelize.TEXT),
				queryInterface.addColumn(tablename, 'P5-18_SecDist_CompQty_CY', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P5-19_CECat_Type', Sequelize.TEXT),
				queryInterface.addColumn(tablename, 'P5-19_Item_MDAPCode', Sequelize.TEXT),
				queryInterface.addColumn(tablename, 'P5-19_SecDist_CompQty_BY1Base', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P5-20_CE_Name', Sequelize.TEXT),
				queryInterface.addColumn(tablename, 'P5-20_InSpares_APY', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P5-21_CEQty_APY', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P5-21_InSpares_PY', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P5-21_SecDist_CompQty_BY1', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P5-22_CEQty_PY', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P5-22_InSpares_CY', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P5-22_ProcQty_APY', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P5-23_CEQty_CY', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P5-23_InSpares_BY1Base', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P5-23_ProcQty_PY', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P5-24_CEQty_BY1Base', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P5-24_InSpares_BY1OCO', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P5-24_ProcQty_CY', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P5-25_InSpares_BY1', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P5-25_ProcQty_BY1Base', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P5-26_CEQty_BY1', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P5-26_SecDist_CompTOA_PY', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P5-27_ProcQty_BY1', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P5-27_SecDist_CompTOA_CY', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P5-28_SecDist_CompTOA_BY1Base', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P5-30_SecDist_CompTOA_BY1', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P5-32_GWSCUC_APY', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P5-33_CECost_APY', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P5-33_GWSCUC_PY', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P5-34_CECost_PY', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P5-34_GWSC_APY', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P5-34_GWSCUC_CY', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P5-35_CECost_CY', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P5-35_GWSC_PY', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P5-35_GWSCUC_BY1Base', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P5-36_CECost_BY1Base', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P5-36_GWSC_CY', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P5-37_CECost_BY1OCO', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P5-37_GWSC_BY1Base', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P5-37_GWSCUC_BY1', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P5-38_CECost_BY1', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P5-38_GWSC_BY1OCO', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P5-39_GWSC_BY1', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P5-45_CEUC_APY', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P5-46_CEUC_PY', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P5-46_LessPYAP_APY', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P5-47_CEUC_CY', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P5-47_LessPYAP_PY', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P5-48_CEUC_BY1Base', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P5-48_LessPYAP_CY', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P5-49_LessPYAP_BY1Base', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P5-50_CEUC_BY1', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P5-51_LessPYAP_BY1', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P5-57_CECat_Type_TotCost_APY', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P5-58_CECat_Type_TotCost_PY', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P5-58_NetP1_APY', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P5-59_CECat_Type_TotCost_CY', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P5-59_NetP1_PY', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P5-60_CECat_Type_TotCost_BY1Base', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P5-60_NetP1_CY', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P5-61_CECat_Type_TotCost_BY1OCO', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P5-61_NetP1_BY1Base', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P5-62_CECat_Type_TotCost_BY1', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P5-62_NetP1_BY1OCO', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P5-63_NetP1_BY1', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P5-69_CECat_TotCost_APY', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P5-70_CECat_TotCost_PY', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P5-70_PlusCYAP_APY', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P5-71_CECat_TotCost_CY', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P5-71_PlusCYAP_PY', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P5-72_CECat_TotCost_BY1Base', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P5-72_PlusCYAP_CY', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P5-73_CECat_TotCost_BY1OCO', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P5-73_PlusCYAP_BY1Base', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P5-74_CECat_TotCost_BY1', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P5-75_PlusCYAP_BY1', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P5-82_TOA_APY', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P5-83_TOA_PY', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P5-84_TOA_CY', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P5-85_TOA_BY1Base', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P5-86_TOA_BY1OCO', Sequelize.DOUBLE),
				queryInterface.addColumn(tablename, 'P5-87_TOA_BY1', Sequelize.DOUBLE),
			]);
		});
	},
};
