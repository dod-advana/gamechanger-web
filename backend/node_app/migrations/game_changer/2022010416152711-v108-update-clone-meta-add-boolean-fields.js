'use strict';
const tablename = 'clone_meta';

module.exports = {
	up: (queryInterface, Sequelize) => {
		return queryInterface.sequelize.transaction(function () {
			return Promise.all([
				queryInterface.addColumn(tablename, 'document_view', { type: Sequelize.BOOLEAN, defaultValue: false }),
				queryInterface.addColumn(tablename, 'user_dashboard', { type: Sequelize.BOOLEAN, defaultValue: true }),
				queryInterface.addColumn(tablename, 'search_suggestions', { type: Sequelize.BOOLEAN, defaultValue: false }),
			]);
		});
	},

	down: (queryInterface, Sequelize) => {
		return queryInterface.sequelize.transaction(function () {
			return Promise.all([
				queryInterface.removeColumn(tablename, 'document_view', Sequelize.BOOLEAN),
				queryInterface.removeColumn(tablename, 'user_dashboard', Sequelize.BOOLEAN),
				queryInterface.removeColumn(tablename, 'search_suggestions', Sequelize.BOOLEAN),
			]);
		});
	}
};
