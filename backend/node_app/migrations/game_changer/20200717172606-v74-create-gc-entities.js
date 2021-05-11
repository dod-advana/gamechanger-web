'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('gc_entities', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING
      },
      type: {
        type: Sequelize.STRING
      },
      description: {
        type: Sequelize.STRING(1000)
      },
      alias: {
        type: Sequelize.STRING
      },
      img_url: {
        type: Sequelize.STRING
      },
      resource_url: {
        type: Sequelize.STRING
      },
      synonyms: {
        type: Sequelize.STRING
      },
      category: {
        type: Sequelize.STRING
      },
      key_people: {
        type: Sequelize.STRING
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('gc_entities');
  }
};