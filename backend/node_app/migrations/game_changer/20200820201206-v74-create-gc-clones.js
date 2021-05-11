'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('gc_clones', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      clone_name: {
          type: Sequelize.STRING
      },
      is_live: {
          type: Sequelize.BOOLEAN
      },
      clone_data: {
          type: Sequelize.JSONB
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('gc_clones');
  }
};