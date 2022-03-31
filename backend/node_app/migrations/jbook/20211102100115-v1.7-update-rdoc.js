'use strict';
const tablename = 'rdoc';
module.exports = {
	up: (queryInterface, Sequelize) => {
		return queryInterface.describeTable(tablename).then((tableDefinition) => {
			const queries = [];

			if (!tableDefinition['composite_key'])
				queries.push(queryInterface.addColumn(tablename, 'composite_key', Sequelize.TEXT));
			if (!tableDefinition['Accomp_Fund_PY_Text'])
				queries.push(queryInterface.addColumn(tablename, 'Accomp_Fund_PY_Text', Sequelize.TEXT));
			if (!tableDefinition['PlanPrgrm_Fund_BY1_Text'])
				queries.push(queryInterface.addColumn(tablename, 'PlanPrgrm_Fund_BY1_Text', Sequelize.TEXT));
			if (!tableDefinition['PlanPrgrm_Fund_BY1Base_Text'])
				queries.push(queryInterface.addColumn(tablename, 'PlanPrgrm_Fund_BY1Base_Text', Sequelize.TEXT));
			if (!tableDefinition['PlanPrgrm_Fund_BY1OCO_Text'])
				queries.push(queryInterface.addColumn(tablename, 'PlanPrgrm_Fund_BY1OCO_Text', Sequelize.TEXT));
			if (!tableDefinition['PlanPrgrm_Fund_CY_Text'])
				queries.push(queryInterface.addColumn(tablename, 'PlanPrgrm_Fund_CY_Text', Sequelize.TEXT));
			if (!tableDefinition['Accomp_Fund_PY_Text_Search'])
				queries.push(queryInterface.addColumn(tablename, 'Accomp_Fund_PY_Text_Search', Sequelize.TSVECTOR));
			if (!tableDefinition['Adj_OtherAdj_Title_Search'])
				queries.push(queryInterface.addColumn(tablename, 'Adj_OtherAdj_Title_Search', Sequelize.TSVECTOR));
			if (!tableDefinition['Appn_Title_Search'])
				queries.push(queryInterface.addColumn(tablename, 'Appn_Title_Search', Sequelize.TSVECTOR));
			if (!tableDefinition['BA_Title_Search'])
				queries.push(queryInterface.addColumn(tablename, 'BA_Title_Search', Sequelize.TSVECTOR));
			if (!tableDefinition['CongAdds_Title_Search'])
				queries.push(queryInterface.addColumn(tablename, 'CongAdds_Title_Search', Sequelize.TSVECTOR));
			if (!tableDefinition['Event_Title_Search'])
				queries.push(queryInterface.addColumn(tablename, 'Event_Title_Search', Sequelize.TSVECTOR));
			if (!tableDefinition['JointFund_Title_Search'])
				queries.push(queryInterface.addColumn(tablename, 'JointFund_Title_Search', Sequelize.TSVECTOR));
			if (!tableDefinition['OthProgFund_Title_Search'])
				queries.push(queryInterface.addColumn(tablename, 'OthProgFund_Title_Search', Sequelize.TSVECTOR));
			if (!tableDefinition['PE_MSN_Dsec_Search'])
				queries.push(queryInterface.addColumn(tablename, 'PE_MSN_Dsec_Search', Sequelize.TSVECTOR));
			if (!tableDefinition['PE_Title_Search'])
				queries.push(queryInterface.addColumn(tablename, 'PE_Title_Search', Sequelize.TSVECTOR));
			if (!tableDefinition['PlanPrgrm_Fund_BY1_Text_Search'])
				queries.push(queryInterface.addColumn(tablename, 'PlanPrgrm_Fund_BY1_Text_Search', Sequelize.TSVECTOR));
			if (!tableDefinition['PlanPrgrm_Fund_BY1OCO_Text_Search'])
				queries.push(
					queryInterface.addColumn(tablename, 'PlanPrgrm_Fund_BY1OCO_Text_Search', Sequelize.TSVECTOR)
				);
			if (!tableDefinition['PlanPrgrm_Fund_BY1Base_Text_Search'])
				queries.push(
					queryInterface.addColumn(tablename, 'PlanPrgrm_Fund_BY1Base_Text_Search', Sequelize.TSVECTOR)
				);
			if (!tableDefinition['PlanPrgrm_Fund_CY_Text_Search'])
				queries.push(queryInterface.addColumn(tablename, 'PlanPrgrm_Fund_CY_Text_Search', Sequelize.TSVECTOR));
			if (!tableDefinition['Proj_Title_Search'])
				queries.push(queryInterface.addColumn(tablename, 'Proj_Title_Search', Sequelize.TSVECTOR));
			if (!tableDefinition['SubProj_Title_Search'])
				queries.push(queryInterface.addColumn(tablename, 'SubProj_Title_Search', Sequelize.TSVECTOR));

			return queryInterface.sequelize.transaction(function () {
				Promise.all(queries);
			});
		});
	},

	down: (queryInterface, Sequelize) => {
		return queryInterface.sequelize.transaction(function () {
			Promise.all([
				queryInterface.removeColumn(tablename, 'composite_key', Sequelize.TEXT),
				queryInterface.removeColumn(tablename, 'Accomp_Fund_PY_Text', Sequelize.TEXT),
				queryInterface.removeColumn(tablename, 'PlanPrgrm_Fund_BY1_Text', Sequelize.TEXT),
				queryInterface.removeColumn(tablename, 'PlanPrgrm_Fund_BY1Base_Text', Sequelize.TEXT),
				queryInterface.removeColumn(tablename, 'PlanPrgrm_Fund_BY1OCO_Text', Sequelize.TEXT),
				queryInterface.removeColumn(tablename, 'PlanPrgrm_Fund_CY_Text', Sequelize.TEXT),
				queryInterface.removeColumn(tablename, 'Accomp_Fund_PY_Text_Search', Sequelize.TSVECTOR),
				queryInterface.removeColumn(tablename, 'Adj_OtherAdj_Title_Search', Sequelize.TSVECTOR),
				queryInterface.removeColumn(tablename, 'Appn_Title_Search', Sequelize.TSVECTOR),
				queryInterface.removeColumn(tablename, 'BA_Title_Search', Sequelize.TSVECTOR),
				queryInterface.removeColumn(tablename, 'CongAdds_Title_Search', Sequelize.TSVECTOR),
				queryInterface.removeColumn(tablename, 'Event_Title_Search', Sequelize.TSVECTOR),
				queryInterface.removeColumn(tablename, 'JointFund_Title_Search', Sequelize.TSVECTOR),
				queryInterface.removeColumn(tablename, 'OthProgFund_Title_Search', Sequelize.TSVECTOR),
				queryInterface.removeColumn(tablename, 'PE_MSN_Dsec_Search', Sequelize.TSVECTOR),
				queryInterface.removeColumn(tablename, 'PE_Title_Search', Sequelize.TSVECTOR),
				queryInterface.removeColumn(tablename, 'PlanPrgrm_Fund_BY1OCO_Text_Search', Sequelize.TSVECTOR),
				queryInterface.removeColumn(tablename, 'PlanPrgrm_Fund_BY1Base_Text_Search', Sequelize.TSVECTOR),
				queryInterface.removeColumn(tablename, 'PlanPrgrm_Fund_CY_Text_Search', Sequelize.TSVECTOR),
				queryInterface.removeColumn(tablename, 'Proj_Title_Search', Sequelize.TSVECTOR),
				queryInterface.removeColumn(tablename, 'SubProj_Title_Search', Sequelize.TSVECTOR),
			]);
		});
	},
};
