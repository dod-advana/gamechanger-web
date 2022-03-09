'use strict';

const tableName = 'clone_meta';

module.exports = {
	 up: (queryInterface, Sequelize) => {
		return queryInterface.describeTable(tableName).then(tableDefinition => {
			const queries = [];

			if (!tableDefinition['permissions']) queries.push(queryInterface.addColumn(tableName, 'permissions', Sequelize.ARRAY(Sequelize.STRING)));

			return queryInterface.sequelize.transaction(function () {
				Promise.all(queries);
			});
		});
	},

	down: (queryInterface, Sequelize) => {
		return queryInterface.sequelize.transaction(function () {
			Promise.all([
				queryInterface.removeColumn(tableName, 'permissions', Sequelize.ARRAY(Sequelize.STRING)),
			]);
		});
	}
};
