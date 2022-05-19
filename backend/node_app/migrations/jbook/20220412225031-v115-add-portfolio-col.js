'use strict';
const tablename = 'portfolio';
module.exports = {
	up: (queryInterface, Sequelize) => {
		return queryInterface.describeTable(tablename).then((tableDefinition) => {
			const queries = [];
			if (!tableDefinition['deleted']) {
				queries.push(queryInterface.addColumn(tablename, 'deleted', Sequelize.BOOLEAN));
			}
			return queryInterface.sequelize.transaction(function () {
				Promise.all(queries);
			});
		});
	},

	down: (queryInterface, Sequelize) => {
		return queryInterface.sequelize.transaction(function () {
			Promise.all([queryInterface.removeColumn(tablename, 'deleted', Sequelize.BOOLEAN)]);
		});
	},
};
