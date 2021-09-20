'use strict';
const tablename = 'clone_meta';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		return queryInterface.sequelize.transaction(function () {
			Promise.all([
				queryInterface.addColumn(tablename, 'data_source_name', Sequelize.TEXT),
				queryInterface.addColumn(tablename, 'source_agency_name', Sequelize.TEXT),
				queryInterface.addColumn(tablename, 'metadata_creation_group', Sequelize.TEXT),
				queryInterface.addColumn(tablename, 'elasticsearch_index', Sequelize.TEXT),
				queryInterface.addColumn(tablename, 'source_s3_bucket', Sequelize.TEXT),
				queryInterface.addColumn(tablename, 'source_s3_prefix', Sequelize.TEXT),
				queryInterface.addColumn(tablename, 'needs_ingest', { type: Sequelize.BOOLEAN, defaultValue: false }),
			])
		});
	},

	down: async (queryInterface, Sequelize) => {
		return queryInterface.sequelize.transaction(function () {
			return Promise.all([
				queryInterface.removeColumn(tablename, 'data_source_name', Sequelize.TEXT),
				queryInterface.removeColumn(tablename, 'source_agency_name', Sequelize.TEXT),
				queryInterface.removeColumn(tablename, 'metadata_creation_group', Sequelize.TEXT),
				queryInterface.removeColumn(tablename, 'elasticsearch_index', Sequelize.TEXT),
				queryInterface.removeColumn(tablename, 'source_s3_bucket', Sequelize.TEXT),
				queryInterface.removeColumn(tablename, 'source_s3_prefix', Sequelize.TEXT),
				queryInterface.removeColumn(tablename, 'needs_ingest', Sequelize.BOOLEAN)
			]);
		});
	}
};
