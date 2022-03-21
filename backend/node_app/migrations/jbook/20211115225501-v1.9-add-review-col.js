'use strict';
const tablename='review';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.describeTable(tablename).then(tableDefinition => {
        const queries = [];
        
         if (!tableDefinition['domain_task']) queries.push(queryInterface.addColumn(tablename, 'domain_task', Sequelize.TEXT));
         if (!tableDefinition['domain_task_secondary']) queries.push(queryInterface.addColumn(tablename, 'domain_task_secondary', Sequelize.TEXT));

        return queryInterface.sequelize.transaction(function () {
            Promise.all(queries);
        });
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(function () {
      Promise.all([
          queryInterface.removeColumn(tablename, 'domain_task', Sequelize.TEXT),
          queryInterface.removeColumn(tablename, 'domain_task_secondary', Sequelize.TEXT),
        ]);
    });
  }
};
