'use strict';
const tablename = 'om';
module.exports = {
	up: (queryInterface, Sequelize) => {
		return queryInterface.describeTable(tablename).then((tableDefinition) => {
			const queries = [];

			if (!tableDefinition['sag_budget_line_item_title_search'])
				queries.push(
					queryInterface.addColumn(tablename, 'sag_budget_line_item_title_search', Sequelize.TSVECTOR)
				);

			return queryInterface.sequelize.transaction(function () {
				Promise.all(queries);
			});
		});
	},

	down: (queryInterface, Sequelize) => {
		return queryInterface.sequelize.transaction(function () {
			Promise.all([
				queryInterface.removeColumn(tablename, 'sag_budget_line_item_title_search', Sequelize.TSVECTOR),
			]);
		});
	},
};
