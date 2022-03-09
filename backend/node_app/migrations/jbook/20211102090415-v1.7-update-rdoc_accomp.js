'use strict';
const tablename='rdoc_accomp';
module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.describeTable(tablename).then(tableDefinition => {
            const queries = [];
            
             if (!tableDefinition['composite_key']) queries.push(queryInterface.addColumn(tablename, 'composite_key', Sequelize.TEXT));
             if (tableDefinition['pe_num'])  queries.push(queryInterface.renameColumn(tablename, 'pe_num', 'PE_Num'));
             if (tableDefinition['project_number'])  queries.push(queryInterface.renameColumn(tablename, 'project_number', 'Project_Number'));
             if (tableDefinition['search'])  queries.push(queryInterface.renameColumn(tablename, 'search', 'Accomp_Fund_PY_Text_Search'));
             if (!tableDefinition['PlanPrgrm_Fund_BY1_Text_Search']) queries.push(queryInterface.addColumn(tablename, 'PlanPrgrm_Fund_BY1_Text_Search', Sequelize.TSVECTOR));
             if (!tableDefinition['PlanPrgrm_Fund_BY1OCO_Text_Search']) queries.push(queryInterface.addColumn(tablename, 'PlanPrgrm_Fund_BY1OCO_Text_Search', Sequelize.TSVECTOR));
             if (!tableDefinition['PlanPrgrm_Fund_BY1Base_Text_Search']) queries.push(queryInterface.addColumn(tablename, 'PlanPrgrm_Fund_BY1Base_Text_Search', Sequelize.TSVECTOR));
             if (!tableDefinition['PlanPrgrm_Fund_CY_Text_Search']) queries.push(queryInterface.addColumn(tablename, 'PlanPrgrm_Fund_CY_Text_Search', Sequelize.TSVECTOR));

            return queryInterface.sequelize.transaction(function () {
                Promise.all(queries);
            });
        });
    },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(function () {
			Promise.all([
			    queryInterface.removeColumn(tablename, 'composite_key', Sequelize.TEXT),
                queryInterface.renameColumn(tablename, 'PE_Num', 'pe_num'),
                queryInterface.renameColumn(tablename, 'Project_Number', 'project_number'),
                queryInterface.renameColumn(tablename, 'Accomp_Fund_PY_Text_Search', 'search'),
                queryInterface.removeColumn(tablename, 'PlanPrgrm_Fund_BY1_Text_Search', Sequelize.TSVECTOR),
                queryInterface.removeColumn(tablename, 'PlanPrgrm_Fund_BY1OCO_Text_Search', Sequelize.TSVECTOR),
                queryInterface.removeColumn(tablename, 'PlanPrgrm_Fund_BY1Base_Text_Search', Sequelize.TSVECTOR),
                queryInterface.removeColumn(tablename, 'PlanPrgrm_Fund_CY_Text_Search', Sequelize.TSVECTOR),
      ]);
    });
  }
};
