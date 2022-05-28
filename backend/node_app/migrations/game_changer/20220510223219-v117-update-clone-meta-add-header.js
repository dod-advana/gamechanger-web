'use strict';
const tablename = 'clone_meta';
module.exports = {
	up: (queryInterface, Sequelize) => {
		return queryInterface.describeTable(tablename).then((tableDefinition) => {
			const queries = [];
			if (!tableDefinition['view_header_module']) {
				queries.push(queryInterface.addColumn(tablename, 'view_header_module', Sequelize.TEXT));
			}
			return queryInterface.sequelize.transaction(function () {
				Promise.all(queries);
			});
		});
	},

	down: (queryInterface, Sequelize) => {
		return queryInterface.sequelize.transaction(function () {
			Promise.all([queryInterface.removeColumn(tablename, 'view_header_module', Sequelize.TEXT)]);
		});
	},
};
