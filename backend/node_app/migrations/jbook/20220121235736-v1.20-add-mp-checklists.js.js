'use strict';
const tablename = 'review';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.describeTable(tablename).then(tableDefinition => {
      const queries = [];
      if (!tableDefinition['poc_mp_checklist']) queries.push(queryInterface.addColumn(tablename, 'poc_mp_checklist', Sequelize.TEXT));
      if (!tableDefinition['service_mp_checklist']) queries.push(queryInterface.addColumn(tablename, 'service_mp_checklist', Sequelize.TEXT));
      return queryInterface.sequelize.transaction(function () {
        Promise.all(queries);
      });
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(function () {
      Promise.all([
        queryInterface.removeColumn(tablename, 'poc_mp_checklist', Sequelize.TEXT),
        queryInterface.removeColumn(tablename, 'service_mp_checklist', Sequelize.TEXT),
      ]);
    });
  }
};
