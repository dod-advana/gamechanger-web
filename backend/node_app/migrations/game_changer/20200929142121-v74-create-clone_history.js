'use strict';

const tableName = 'gc_history';

module.exports = {
	up: (queryInterface, Sequelize) => queryInterface.createTable(tableName, {
		id: {
			type: Sequelize.INTEGER,
			autoIncrement: true,
			primaryKey: true,
		},
		user_id: {
			type: Sequelize.TEXT
		},
		clone_name: {
			type: Sequelize.TEXT
		},
		search: {
			type: Sequelize.TEXT
		},
		num_results: {
			type: Sequelize.INTEGER
		},
		had_error: {
			type: Sequelize.BOOLEAN
		},
		run_at: {
			type: Sequelize.DATE
		},
		completion_time: {
			type: Sequelize.DATE
		},
		is_semantic_search: {
			type: Sequelize.BOOLEAN
		}
	}),

	down: (queryInterface, Sequelize) => queryInterface.dropTable(tableName)
};
