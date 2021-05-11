'use strict';
const tablename = 'clone_meta';

module.exports = {
	up: (queryInterface, Sequelize) => {
		return queryInterface.sequelize.transaction(function () {
			return Promise.all([
				queryInterface.addColumn(tablename, 'display_name', Sequelize.STRING),
				queryInterface.addColumn(tablename, 'title_bar_module', Sequelize.STRING),
				queryInterface.addColumn(tablename, 'navigation_module', Sequelize.STRING),
				queryInterface.addColumn(tablename, 'card_module', Sequelize.STRING),
				queryInterface.addColumn(tablename, 'is_live', Sequelize.BOOLEAN),
				queryInterface.addColumn(tablename, 'url', Sequelize.STRING),
				queryInterface.addColumn(tablename, 'permissions_required', Sequelize.BOOLEAN),
				queryInterface.addColumn(tablename, 'clone_to_advana', Sequelize.BOOLEAN),
				queryInterface.addColumn(tablename, 'clone_to_gamechanger', Sequelize.BOOLEAN),
				queryInterface.addColumn(tablename, 'clone_to_sipr', Sequelize.BOOLEAN),
				queryInterface.addColumn(tablename, 'clone_to_jupiter', Sequelize.BOOLEAN),
				queryInterface.addColumn(tablename, 'show_tutorial', Sequelize.BOOLEAN),
				queryInterface.addColumn(tablename, 'show_graph', Sequelize.BOOLEAN),
				queryInterface.addColumn(tablename, 'show_crowd_source', Sequelize.BOOLEAN),
				queryInterface.addColumn(tablename, 'show_feedback', Sequelize.BOOLEAN),
				queryInterface.addColumn(tablename, 'config', Sequelize.JSONB),
			]);
		});
	},

	down: (queryInterface, Sequelize) => {
		return queryInterface.sequelize.transaction(function () {
			return Promise.all([
				queryInterface.removeColumn(tablename, 'display_name', Sequelize.STRING),
				queryInterface.removeColumn(tablename, 'title_bar_module', Sequelize.STRING),
				queryInterface.removeColumn(tablename, 'navigation_module', Sequelize.STRING),
				queryInterface.removeColumn(tablename, 'card_module', Sequelize.STRING),
				queryInterface.removeColumn(tablename, 'is_live', Sequelize.BOOLEAN),
				queryInterface.removeColumn(tablename, 'url', Sequelize.STRING),
				queryInterface.removeColumn(tablename, 'permissions_required', Sequelize.BOOLEAN),
				queryInterface.removeColumn(tablename, 'clone_to_advana', Sequelize.BOOLEAN),
				queryInterface.removeColumn(tablename, 'clone_to_gamechanger', Sequelize.BOOLEAN),
				queryInterface.removeColumn(tablename, 'clone_to_sipr', Sequelize.BOOLEAN),
				queryInterface.removeColumn(tablename, 'clone_to_jupiter', Sequelize.BOOLEAN),
				queryInterface.removeColumn(tablename, 'show_tutorial', Sequelize.BOOLEAN),
				queryInterface.removeColumn(tablename, 'show_graph', Sequelize.BOOLEAN),
				queryInterface.removeColumn(tablename, 'show_crowd_source', Sequelize.BOOLEAN),
				queryInterface.removeColumn(tablename, 'show_feedback', Sequelize.BOOLEAN),
				queryInterface.removeColumn(tablename, 'config', Sequelize.JSONB),
			]);
		});
	}
};
