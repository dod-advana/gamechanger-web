'use strict';
const tablename = 'review';

module.exports = {
	up: (queryInterface, Sequelize) => {
		return queryInterface.describeTable(tablename).then((tableDefinition) => {
			const queries = [];
			if (!tableDefinition['latest_class_label'])
				queries.push(queryInterface.addColumn(tablename, 'latest_class_label', Sequelize.TEXT));
			return queryInterface.sequelize.transaction(function () {
				Promise.all(queries);
			});
		});
	},

	down: (queryInterface, Sequelize) => {
		return queryInterface.sequelize.transaction(function () {
			Promise.all([queryInterface.removeColumn(tablename, 'latest_class_label', Sequelize.TEXT)]);
		});
	},
};
