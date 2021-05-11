'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('tutorial_overlays', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      app_name: {
        type: Sequelize.STRING
      },
      current_tutorial_json: {
        type: Sequelize.JSONB
      },
      new_user_tutorial_json: {
        type: Sequelize.JSONB
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('tutorial_overlays');
  }
};