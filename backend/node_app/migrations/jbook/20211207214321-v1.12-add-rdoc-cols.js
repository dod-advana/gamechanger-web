'use strict';
const tablename='rdoc';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.describeTable(tablename).then(tableDefinition => {
        const queries = [];
        
         if (!tableDefinition['Proj_MSN_Desc']) queries.push(queryInterface.addColumn(tablename, 'Proj_MSN_Desc', Sequelize.TEXT));
         if (!tableDefinition['Proj_Notes']) queries.push(queryInterface.addColumn(tablename, 'Proj_Notes', Sequelize.TEXT));
         if (!tableDefinition['Proj_Aquisition_Startegy']) queries.push(queryInterface.addColumn(tablename, 'Proj_Aquisition_Startegy', Sequelize.TEXT));
         if (!tableDefinition['Proj_Performance_Metrics']) queries.push(queryInterface.addColumn(tablename, 'Proj_Performance_Metrics', Sequelize.TEXT));
         if (!tableDefinition['OthProgFund_Summary_Remarks']) queries.push(queryInterface.addColumn(tablename, 'OthProgFund_Summary_Remarks', Sequelize.TEXT));

        //  if (!tableDefinition['Proj_MSN_Desc_Search']) queries.push(queryInterface.addColumn(tablename, 'Proj_MSN_Desc_Search', Sequelize.TSVECTOR));
        //  if (!tableDefinition['Proj_Notes_Search']) queries.push(queryInterface.addColumn(tablename, 'Proj_Notes_Search', Sequelize.TSVECTOR));
        //  if (!tableDefinition['Proj_Aquisition_Strategy_Search']) queries.push(queryInterface.addColumn(tablename, 'Proj_Aquisition_Strategy_Search', Sequelize.TSVECTOR));
        //  if (!tableDefinition['Proj_Performance_Metrics_Search']) queries.push(queryInterface.addColumn(tablename, 'Proj_Performance_Metrics_Search', Sequelize.TSVECTOR));
        //  if (!tableDefinition['OthProgFund_Summary_Remarks_Search']) queries.push(queryInterface.addColumn(tablename, 'OthProgFund_Summary_Remarks_Search', Sequelize.TSVECTOR));

        return queryInterface.sequelize.transaction(function () {
            Promise.all(queries);
        });
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(function () {
      Promise.all([
          queryInterface.removeColumn(tablename, 'Proj_MSN_Desc', Sequelize.TEXT),
          queryInterface.removeColumn(tablename, 'Proj_Notes', Sequelize.TEXT),
          queryInterface.removeColumn(tablename, 'Proj_Aquisition_Startegy', Sequelize.TEXT),
          queryInterface.removeColumn(tablename, 'Proj_Performance_Metrics', Sequelize.TEXT),
          queryInterface.removeColumn(tablename, 'OthProgFund_Summary_Remarks', Sequelize.TEXT),
          
          // queryInterface.removeColumn(tablename, 'Proj_MSN_Desc_Search', Sequelize.TSVECTOR),
          // queryInterface.removeColumn(tablename, 'Proj_Notes_Search', Sequelize.TSVECTOR),
          // queryInterface.removeColumn(tablename, 'Proj_Aquisition_Strategy_Search', Sequelize.TSVECTOR),
          // queryInterface.removeColumn(tablename, 'Proj_Performance_Metrics_Search', Sequelize.TSVECTOR),
          // queryInterface.removeColumn(tablename, 'OthProgFund_Summary_Remarks_Search', Sequelize.TSVECTOR),

        ]);
    });
  }
};
