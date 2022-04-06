'use strict';
const tablename = 'users';

module.exports = {
	up: (queryInterface, Sequelize) => {
		return queryInterface.describeTable(tablename).then((tableDefinition) => {
			const queries = [];

			if (!tableDefinition['preferred_name'])
				queries.push(queryInterface.addColumn(tablename, 'preferred_name', Sequelize.TEXT));
			if (!tableDefinition['sub_office'])
				queries.push(queryInterface.addColumn(tablename, 'sub_office', Sequelize.TEXT));
			if (!tableDefinition['country'])
				queries.push(queryInterface.addColumn(tablename, 'country', Sequelize.TEXT));
			if (!tableDefinition['state']) queries.push(queryInterface.addColumn(tablename, 'state', Sequelize.TEXT));
			if (!tableDefinition['city']) queries.push(queryInterface.addColumn(tablename, 'city', Sequelize.TEXT));
			if (!tableDefinition['job_title'])
				queries.push(queryInterface.addColumn(tablename, 'job_title', Sequelize.TEXT));

			return queryInterface.sequelize.transaction(function () {
				Promise.all(queries);
			});
		});
	},

	down: (queryInterface, Sequelize) => {
		return queryInterface.sequelize.transaction(function () {
			Promise.all([
				queryInterface.removeColumn(tablename, 'preferred_name', Sequelize.TEXT),
				queryInterface.removeColumn(tablename, 'sub_office', Sequelize.TEXT),
				queryInterface.removeColumn(tablename, 'country', Sequelize.TEXT),
				queryInterface.removeColumn(tablename, 'state', Sequelize.TEXT),
				queryInterface.removeColumn(tablename, 'city', Sequelize.TEXT),
				queryInterface.removeColumn(tablename, 'job_title', Sequelize.TEXT),
			]);
		});
	},
};
