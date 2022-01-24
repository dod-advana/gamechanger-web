'use strict';
const tablename = 'clone_meta';

module.exports = {
	up: (queryInterface, Sequelize) => {
		return queryInterface.sequelize.transaction(function () {
			return Promise.all([
				queryInterface.removeColumn(tablename, 'data_source_name'),
				queryInterface.removeColumn(tablename, 'source_agency_name'),
			]);
		});
	},

	down: (queryInterface, Sequelize) => {
		return queryInterface.sequelize.transaction(function () {
			return Promise.all([
				queryInterface.addColumn(tablename, 'data_source_name', Sequelize.TEXT),
				queryInterface.addColumn(tablename, 'source_agency_name', Sequelize.TEXT),
			]);
		});
	}
};
