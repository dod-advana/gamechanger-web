'use strict';
const tablename='pdoc';
module.exports = {
	up: (queryInterface, Sequelize) => {
		return queryInterface.describeTable(tablename).then(tableDefinition => {
			const queries = [];
			
			if (!tableDefinition['composite_key']) queries.push(queryInterface.addColumn(tablename, 'composite_key', Sequelize.TEXT));
			if (!tableDefinition['P3a_InstSched_IN_APY_']) queries.push(queryInterface.addColumn(tablename, 'P3a_InstSched_IN_APY_', Sequelize.DOUBLE));
			if (!tableDefinition['P3a_InstSched_OUT_APY_']) queries.push(queryInterface.addColumn(tablename, 'P3a_InstSched_OUT_APY_', Sequelize.DOUBLE));
			if (!tableDefinition['P3a-101_Proc_SubTotQty_BY1']) queries.push(queryInterface.addColumn(tablename, 'P3a-101_Proc_SubTotQty_BY1', Sequelize.DOUBLE));
			if (!tableDefinition['P3a-108_Proc_SubTotCost_APY']) queries.push(queryInterface.addColumn(tablename, 'P3a-108_Proc_SubTotCost_APY', Sequelize.DOUBLE));
			if (!tableDefinition['P3a-109_Proc_SubTotCost_PY']) queries.push(queryInterface.addColumn(tablename, 'P3a-109_Proc_SubTotCost_PY', Sequelize.DOUBLE));
			if (!tableDefinition['P3a-110_Proc_SubTotCost_CY']) queries.push(queryInterface.addColumn(tablename, 'P3a-110_Proc_SubTotCost_CY', Sequelize.DOUBLE));
			if (!tableDefinition['P3a-111_Proc_SubTotCost_BY1Base']) queries.push(queryInterface.addColumn(tablename, 'P3a-111_Proc_SubTotCost_BY1Base', Sequelize.DOUBLE));
			if (!tableDefinition['P3a-113_Proc_SubTotCost_BY1']) queries.push(queryInterface.addColumn(tablename, 'P3a-113_Proc_SubTotCost_BY1', Sequelize.DOUBLE));
			if (!tableDefinition['P3a-18_Rel_PE']) queries.push(queryInterface.addColumn(tablename, 'P3a-18_Rel_PE', Sequelize.TEXT));
			if (!tableDefinition['P3a-22_Kit_Name']) queries.push(queryInterface.addColumn(tablename, 'P3a-22_Kit_Name', Sequelize.TEXT));
			if (!tableDefinition['P3a-23_KitQty_APY']) queries.push(queryInterface.addColumn(tablename, 'P3a-23_KitQty_APY', Sequelize.TEXT));
			if (!tableDefinition['P3a-24_KitQty_PY']) queries.push(queryInterface.addColumn(tablename, 'P3a-24_KitQty_PY', Sequelize.TEXT));
			
		    return queryInterface.sequelize.transaction(function () {
			    Promise.all(queries);
		    });
		});
	},

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(function () {
			Promise.all([
			    queryInterface.removeColumn(tablename, 'composite_key', Sequelize.TEXT),
				queryInterface.removeColumn(tablename, 'P3a_InstSched_IN_APY_', Sequelize.DOUBLE),
			    queryInterface.removeColumn(tablename, 'P3a_InstSched_OUT_APY_', Sequelize.DOUBLE),
			    queryInterface.removeColumn(tablename, 'P3a-101_Proc_SubTotQty_BY1', Sequelize.DOUBLE),
			    queryInterface.removeColumn(tablename, 'P3a-108_Proc_SubTotCost_APY', Sequelize.DOUBLE),
			    queryInterface.removeColumn(tablename, 'P3a-109_Proc_SubTotCost_PY', Sequelize.DOUBLE),
			    queryInterface.removeColumn(tablename, 'P3a-110_Proc_SubTotCost_CY', Sequelize.DOUBLE),
			    queryInterface.removeColumn(tablename, 'P3a-111_Proc_SubTotCost_BY1Base', Sequelize.DOUBLE),
			    queryInterface.removeColumn(tablename, 'P3a-113_Proc_SubTotCost_BY1', Sequelize.DOUBLE),
			    queryInterface.removeColumn(tablename, 'P3a-18_Rel_PE', Sequelize.TEXT),
			    queryInterface.removeColumn(tablename, 'P3a-22_Kit_Name', Sequelize.TEXT),
			    queryInterface.removeColumn(tablename, 'P3a-23_KitQty_APY', Sequelize.TEXT),
			    queryInterface.removeColumn(tablename, 'P3a-24_KitQty_PY', Sequelize.TEXT),
      ]);
    });
  }
};
