'use strict';
const tablename='gc_users';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.describeTable(tablename).then(tableDefinition => {
        const queries = [];

         if (!tableDefinition['cn']) queries.push(queryInterface.addColumn(tablename, 'cn', Sequelize.TEXT));
         if (!tableDefinition['first_name']) queries.push(queryInterface.addColumn(tablename, 'first_name', Sequelize.TEXT));
         if (!tableDefinition['last_name']) queries.push(queryInterface.addColumn(tablename, 'last_name', Sequelize.TEXT));
         if (!tableDefinition['organization']) queries.push(queryInterface.addColumn(tablename, 'organization', Sequelize.TEXT));
         if (!tableDefinition['email']) queries.push(queryInterface.addColumn(tablename, 'email', Sequelize.TEXT));
         if (!tableDefinition['is_beta']) queries.push(queryInterface.addColumn(tablename, 'is_beta', Sequelize.BOOLEAN));
         if (!tableDefinition['is_internal']) queries.push(queryInterface.addColumn(tablename, 'is_internal', Sequelize.BOOLEAN));
         if (!tableDefinition['is_admin']) queries.push(queryInterface.addColumn(tablename, 'is_admin', Sequelize.BOOLEAN));

        return queryInterface.sequelize.transaction(function () {
            Promise.all(queries);
        })
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(function () {
      Promise.all([
          queryInterface.removeColumn(tablename, 'cn', Sequelize.TEXT),
          queryInterface.removeColumn(tablename, 'first_name', Sequelize.TEXT),
          queryInterface.removeColumn(tablename, 'last_name', Sequelize.TEXT),
          queryInterface.removeColumn(tablename, 'organization', Sequelize.TEXT),
          queryInterface.removeColumn(tablename, 'email', Sequelize.TEXT),
          queryInterface.removeColumn(tablename, 'is_beta', Sequelize.BOOLEAN),
          queryInterface.removeColumn(tablename, 'is_internal', Sequelize.BOOLEAN),
          queryInterface.removeColumn(tablename, 'is_admin', Sequelize.BOOLEAN),
        ])
    });
  }
};
