'use strict';
const tablename = 'clone_meta'

module.exports = {
	up: async (queryInterface, Sequelize) => {
		return queryInterface.sequelize.transaction(function () {
			return Promise.all([
				queryInterface.removeColumn(tablename, 'clone_to_advana', Sequelize.BOOLEAN),
				queryInterface.removeColumn(tablename, 'clone_to_gamechanger', Sequelize.BOOLEAN),
				queryInterface.removeColumn(tablename, 'clone_to_jupiter', Sequelize.BOOLEAN),
        queryInterface.addColumn(tablename, 'available_at', Sequelize.ARRAY(Sequelize.STRING))
			]);
		});
	},

	down: async (queryInterface, Sequelize) => {
		return queryInterface.sequelize.transaction(function () {
			return Promise.all([
				queryInterface.addColumn(tablename, 'clone_to_advana', Sequelize.BOOLEAN),
				queryInterface.addColumn(tablename, 'clone_to_gamechanger', Sequelize.BOOLEAN),
				queryInterface.addColumn(tablename, 'clone_to_jupiter', Sequelize.BOOLEAN),
        queryInterface.removeColumn(tablename, 'available_at', Sequelize.ARRAY(Sequelize.STRING))
      ]);
		});
	}
};
