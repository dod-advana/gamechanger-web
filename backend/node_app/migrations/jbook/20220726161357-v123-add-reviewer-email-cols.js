'use strict';
const tablename = 'review';
module.exports = {
	up: (queryInterface, Sequelize) => {
		return queryInterface.describeTable(tablename).then((tableDefinition) => {
			const queries = [];
			if (!tableDefinition['primary_reviewer_email']) {
				queries.push(queryInterface.addColumn(tablename, 'primary_reviewer_email', Sequelize.TEXT));
			}
			if (!tableDefinition['service_reviewer_email']) {
				queries.push(queryInterface.addColumn(tablename, 'service_reviewer_email', Sequelize.TEXT));
			}
			if (!tableDefinition['service_secondary_reviewer_email']) {
				queries.push(queryInterface.addColumn(tablename, 'service_secondary_reviewer_email', Sequelize.TEXT));
			}
			return queryInterface.sequelize.transaction(function () {
				Promise.all(queries);
			});
		});
	},

	down: (queryInterface, Sequelize) => {
		return queryInterface.sequelize.transaction(function () {
			Promise.all([queryInterface.removeColumn(tablename, 'primary_reviewer_email', Sequelize.TEXT)]);
			Promise.all([queryInterface.removeColumn(tablename, 'service_reviewer_email', Sequelize.TEXT)]);
			Promise.all([queryInterface.removeColumn(tablename, 'service_secondary_reviewer_email', Sequelize.TEXT)]);
		});
	},
};
