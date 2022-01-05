'use strict';
const tablename = 'clone_meta';

module.exports = {
	up: (queryInterface, Sequelize) => {
		return queryInterface.sequelize.transaction(function () {
			return Promise.all([
				queryInterface.addColumn(tablename, 'document_view', { type: Sequelize.BOOLEAN, defaultValue: true }),
				queryInterface.addColumn(tablename, 'user_favorites', { type: Sequelize.BOOLEAN, defaultValue: true }),
			]);
		});
	},

	down: (queryInterface, Sequelize) => {
		return queryInterface.sequelize.transaction(function () {
			return Promise.all([
				queryInterface.removeColumn(tablename, 'document_view', Sequelize.BOOLEAN),
				queryInterface.removeColumn(tablename, 'user_favorites', Sequelize.BOOLEAN),
			]);
		});
	}
};
