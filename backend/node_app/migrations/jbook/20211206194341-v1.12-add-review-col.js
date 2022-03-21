'use strict';
const tablename='review';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.describeTable(tablename).then(tableDefinition => {
        const queries = [];
        
         if (!tableDefinition['robotics_system_agree']) queries.push(queryInterface.addColumn(tablename, 'robotics_system_agree', Sequelize.TEXT));

        return queryInterface.sequelize.transaction(function () {
            Promise.all(queries);
        });
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(function () {
      Promise.all([
          queryInterface.removeColumn(tablename, 'robotics_system_agree', Sequelize.TEXT),
        ]);
    });
  }
};
