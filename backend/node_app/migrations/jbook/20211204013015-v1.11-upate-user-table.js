'use strict';
const tablename='users';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.describeTable(tablename).then(tableDefinition => {
        const queries = [];

         if (!tableDefinition['phone_number']) queries.push(queryInterface.addColumn(tablename, 'phone_number', {type: Sequelize.TEXT, unique: true}));

        return queryInterface.sequelize.transaction(function () {
            Promise.all(queries);
        });
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(function () {
      Promise.all([
          queryInterface.removeColumn(tablename, 'phone_number', Sequelize.TEXT)
        ]);
    });
  }
};
