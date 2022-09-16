'use strict';
const tablename = 'portfolio';
module.exports = {
	up: (queryInterface, Sequelize) => {
		return queryInterface.describeTable(tablename).then((tableDefinition) => {
			const queries = [];
			if (!tableDefinition['private']) {
				queries.push(
					queryInterface.addColumn(tablename, 'private', { type: Sequelize.BOOLEAN, defaultValue: false })
				);
			}
			return queryInterface.sequelize.transaction(function () {
				Promise.all(queries);
			});
		});
	},

	down: (queryInterface, Sequelize) => {
		return queryInterface.sequelize.transaction(function () {
			Promise.all([queryInterface.removeColumn(tablename, 'private', Sequelize.BOOLEAN)]);
		});
	},
};
