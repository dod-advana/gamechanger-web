'use strict';
const tablename='users';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.describeTable(tablename).then(tableDefinition => {
        const queries = [];

         queries.push(queryInterface.changeColumn(tablename, 'phone_number', {type: Sequelize.TEXT, unique: false}));

        return queryInterface.sequelize.transaction(function () {
            Promise.all(queries);
        });
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(function () {
      Promise.all([
          queryInterface.changeColumn(tablename, 'phone_number', {type: Sequelize.TEXT, unique: true})
        ]);
    });
  }
};
