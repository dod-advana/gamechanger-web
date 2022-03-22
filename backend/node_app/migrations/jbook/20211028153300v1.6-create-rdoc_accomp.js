'use strict';
module.exports = {
	up: (queryInterface, Sequelize) => {
		return queryInterface.createTable('rdoc_accomp', {
			id: {
				type: Sequelize.INTEGER,
				autoIncrement: true,
				primaryKey: true,
			},
            pe_num : {
                type: Sequelize.TEXT,
            },
			project_number: {
                type: Sequelize.TEXT,
            },
            BudgetYear: {
                type: Sequelize.TEXT,
            },
            BudgetCycle: {
                type: Sequelize.TEXT,
            },
            Accomp_Fund_PY: {
                type: Sequelize.DOUBLE,
            },
            Accomp_Fund_PY_Text: {
                type: Sequelize.TEXT,
            },
            PlanPrgrm_Fund_BY1: {
                type: Sequelize.DOUBLE,
            },
			PlanPrgrm_Fund_BY1_Text: {
                type: Sequelize.TEXT,
            },
            PlanPrgrm_Fund_BY1Base: {
                type: Sequelize.DOUBLE,
            },
			PlanPrgrm_Fund_BY1Base_Text: {
                type: Sequelize.TEXT,
            },
			PlanPrgrm_Fund_BY1OCO: {
                type: Sequelize.DOUBLE,
            },
			PlanPrgrm_Fund_BY1OCO_Text: {
                type: Sequelize.TEXT,
            },
			PlanPrgrm_Fund_CY: {
                type: Sequelize.DOUBLE,
            },
			PlanPrgrm_Fund_CY_Text: {
                type: Sequelize.TEXT,
            },
		});
	},
	down: (queryInterface, Sequelize) => {
		return queryInterface.dropTable('rdoc_accomp');
	}
};
