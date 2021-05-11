'use strict';
const tablename = 'gc_history';

module.exports = {
	up: (queryInterface, Sequelize) => {
		return queryInterface.sequelize.transaction(function () {
			return Promise.all([
				queryInterface.removeColumn(tablename, 'is_semantic_search'),
				queryInterface.removeColumn(tablename, 'org_filters'),
				queryInterface.addColumn(tablename, 'request_body', Sequelize.JSONB),
				queryInterface.addColumn(tablename, 'search_version', {
					type: Sequelize.INTEGER,
					defaultValue: 0
				}),
				queryInterface.addColumn(tablename, 'search_type', Sequelize.TEXT),
				queryInterface.addColumn(tablename, 'clone_name', Sequelize.TEXT),
			]);
		});
	},

	down: (queryInterface, Sequelize) => {
		return queryInterface.sequelize.transaction(function () {
			return Promise.all([
				queryInterface.addColumn(tablename, 'is_semantic_search', Sequelize.BOOLEAN),
				queryInterface.addColumn(tablename, 'org_filters', Sequelize.JSONB),
				queryInterface.removeColumn(tablename, 'request_body'),
				queryInterface.removeColumn(tablename, 'search_version'),
				queryInterface.removeColumn(tablename, 'search_type'),
				queryInterface.removeColumn(tablename, 'clone_name'),
			]);
		});
	}
};
