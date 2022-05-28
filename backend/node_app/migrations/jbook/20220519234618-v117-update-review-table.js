'use strict';
const tablename = 'review';

module.exports = {
	up: (queryInterface, Sequelize) => {
		return queryInterface.describeTable(tablename).then((tableDefinition) => {
			const queries = [];
			if (tableDefinition['portfolio_id']) {
				queries.push(queryInterface.removeColumn(tablename, 'portfolio_id', Sequelize.INTEGER));
			}
			if (!tableDefinition['portfolio_name']) {
				queries.push(queryInterface.addColumn(tablename, 'portfolio_name', Sequelize.TEXT));
				queries.push(
					queryInterface.addConstraint('portfolio', {
						fields: ['name'],
						type: 'unique',
						name: 'unique_portfolio_name_constraint',
					})
				);
				queries.push(
					queryInterface.addConstraint('review', {
						fields: ['portfolio_name'],
						type: 'foreign key',
						references: {
							table: 'portfolio',
							field: 'name',
						},
						onDelete: 'no action',
					})
				);
			}
			return queryInterface.sequelize.transaction(function () {
				Promise.all(queries);
			});
		});
	},

	down: (queryInterface, Sequelize) => {
		return queryInterface.sequelize.transaction(function () {
			Promise.all([
				queryInterface.addColumn(tablename, 'portfolio_id', Sequelize.INTEGER),
				queryInterface.removeColumn(tablename, 'portfolio_name', Sequelize.TEXT),
			]);
		});
	},
};
