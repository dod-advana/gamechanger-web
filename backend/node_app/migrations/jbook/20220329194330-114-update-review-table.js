'use strict';
const tablename = 'review';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.describeTable(tablename).then(tableDefinition => {
      const queries = [
        queryInterface.removeColumn(tablename, 'rev_trans_agree', Sequelize.TEXT),
        queryInterface.removeColumn(tablename, 'reviewer', Sequelize.TEXT)
      ];
      if (!tableDefinition['portfolio_id']) {
        queries.push(queryInterface.addColumn(tablename, 'portfolio_id', Sequelize.INTEGER));
        queries.push(queryInterface.addConstraint('review', {
          fields: ['portfolio_id'],
          type: 'foreign key',
          references: {
            table: 'portfolio',
            field: 'id'
          },
          onDelete: 'no action'
        }));
      }
      return queryInterface.sequelize.transaction(function () {
        Promise.all(queries);
      });
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(function () {
      Promise.all([
        queryInterface.addColumn(tablename, 'rev_trans_agree', Sequelize.TEXT),
        queryInterface.addColumn(tablename, 'reviewer', Sequelize.TEXT),
        queryInterface.removeColumn(tablename, 'portfolio_id', Sequelize.INTEGER)
      ]);
    });
  }
};
