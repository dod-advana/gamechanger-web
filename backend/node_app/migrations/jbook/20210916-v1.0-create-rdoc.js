'use strict';
module.exports = {
	up: (queryInterface, Sequelize) => {
		return queryInterface.createTable('rdoc', {
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.INTEGER,
			},
			Appn_Num: {
				type: Sequelize.TEXT,
			},
			Appn_Title: {
				type: Sequelize.TEXT,
			},
			AwardDate_BY1Base: {
				type: Sequelize.TEXT,
			},
			AwardDate_BY1OCO: {
				type: Sequelize.TEXT,
			},
			AwardDate_CY: {
				type: Sequelize.TEXT,
			},
			AwardDate_PY: {
				type: Sequelize.TEXT,
			},
			BA_Number: {
				type: Sequelize.TEXT,
			},
			BA_Title: {
				type: Sequelize.TEXT,
			},
			BudgetCycle: {
				type: Sequelize.TEXT,
			},
			BudgetYear: {
				type: Sequelize.TEXT,
			},
			ContractMethod: {
				type: Sequelize.TEXT,
			},
			ContractType: {
				type: Sequelize.TEXT,
			},
			CostCat_Item_Name: {
				type: Sequelize.TEXT,
			},
			CostCat_Item_PerfAct: {
				type: Sequelize.TEXT,
			},
			CostCat_Item_Perfact_Location: {
				type: Sequelize.TEXT,
			},
			CostCat_Name: {
				type: Sequelize.TEXT,
			},
			FundingVehicle: {
				type: Sequelize.TEXT,
			},
			Location: {
				type: Sequelize.TEXT,
			},
			Organization: {
				type: Sequelize.TEXT,
			},
			OrganizationCode: {
				type: Sequelize.TEXT,
			},
			PE_MDAP_Code: {
				type: Sequelize.TEXT,
			},
			PE_MSN_Dsec: {
				type: Sequelize.TEXT,
			},
			uot_budgetlineitem: {
				type: Sequelize.TEXT,
			},
			uot_budgetlineitemtitle: {
				type: Sequelize.TEXT,
			},
			performingactivity: {
				type: Sequelize.TEXT,
			},
			Proj_Number: {
				type: Sequelize.TEXT,
			},
			Proj_Title: {
				type: Sequelize.TEXT,
			},
			R1_Line_Num: {
				type: Sequelize.TEXT,
			},
			costCatItemCostAPY: {
				type: Sequelize.TEXT,
			},
			costCatItemCostBY1: {
				type: Sequelize.TEXT,
			},
			costCatItemCostBY1Base: {
				type: Sequelize.TEXT,
			},
			costCatItemCostBY1OCO: {
				type: Sequelize.TEXT,
			},
			costCatItemCostCTC: {
				type: Sequelize.TEXT,
			},
			costCatItemCostCY: {
				type: Sequelize.TEXT,
			},
			costCatItemCostPY: {
				type: Sequelize.TEXT,
			},
			costCatItemCostTotal: {
				type: Sequelize.TEXT,
			},
			costcatitemcosttv: {
				type: Sequelize.TEXT,
			},
			costcatitemname: {
				type: Sequelize.TEXT,
			},
			costcatname: {
				type: Sequelize.TEXT,
			},
			PE_MSN_desc: {
				type: Sequelize.TEXT,
			},
			PE_Num: {
				type: Sequelize.TEXT,
			},
			PE_Title: {
				type: Sequelize.TEXT,
			},
			EndDate: {
				type: Sequelize.TEXT,
			},
			EndQuarter: {
				type: Sequelize.TEXT,
			},
			EndYear: {
				type: Sequelize.TEXT,
			},
			Event_Title: {
				type: Sequelize.TEXT,
			},
			StartDate: {
				type: Sequelize.TEXT,
			},
			StartQuarter: {
				type: Sequelize.TEXT,
			},
			StartYear: {
				type: Sequelize.TEXT,
			},
			SubProj_Title: {
				type: Sequelize.TEXT,
			},
		});
	},
	down: (queryInterface, _Sequelize) => {
		return queryInterface.dropTable('rdoc');
	},
};
