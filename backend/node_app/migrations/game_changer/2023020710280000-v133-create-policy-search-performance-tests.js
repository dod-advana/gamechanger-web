'use strict';
const tablename = 'policy_search_performance_tests';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.createTable(tablename, {
			test_id: {
				type: Sequelize.INTEGER,
				autoIncrement: true,
				primaryKey: true,
			},
			gc_version: {
				type: Sequelize.TEXT,
				allowNull: false,
			},
			total_average: {
				type: Sequelize.INTEGER,
			},
			total_number_of_documents_not_found: {
				type: Sequelize.INTEGER,
			},
			source_results: {
				type: Sequelize.JSONB,
			},
			timestamp: {
				type: Sequelize.DATE,
				defaultValue: Sequelize.fn('NOW'),
			},
			createdAt: Sequelize.DATE,
			updatedAt: Sequelize.DATE,
		});
	},
	down: async (queryInterface, _Sequelize) => {
		await queryInterface.dropTable(tablename);
	},
};
