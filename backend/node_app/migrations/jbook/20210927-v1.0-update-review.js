'use strict';
const tablename = 'review';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		return queryInterface.sequelize.transaction(function () {
			// return Promise.all([
			//     queryInterface.removeColumn(tablename, 'rev_review_stat'),
			//     queryInterface.removeColumn(tablename, 'secrev_notes'),
			//     queryInterface.removeColumn(tablename, 'secrev_review_stat'),
			//     queryInterface.addColumn(tablename, 'jaic_review_status', Sequelize.TEXT),
			//     queryInterface.addColumn(tablename, 'service_review_status', Sequelize.TEXT),
			//     queryInterface.addColumn(tablename, 'poc_review_status', Sequelize.TEXT),
			//     queryInterface.addColumn(tablename, 'jaic_reviewer', Sequelize.TEXT),
			//     queryInterface.addColumn(tablename, 'service_reviewer', Sequelize.TEXT),
			//     queryInterface.addColumn(tablename, 'poc_reviewer', Sequelize.TEXT),
			//     queryInterface.addColumn(tablename, 'other_mission_partners', Sequelize.TEXT),
			//     queryInterface.addColumn(tablename, 'service_reviewer_notes', Sequelize.TEXT),
			//     queryInterface.addColumn(tablename, 'dollars_attributed_category', Sequelize.TEXT),
			//     queryInterface.addColumn(tablename, 'dollars_attributed', Sequelize.TEXT),
			//     queryInterface.addColumn(tablename, 'percentage_attributed_category', Sequelize.TEXT),
			//     queryInterface.addColumn(tablename, 'percentage_attributed', Sequelize.TEXT),
			//     queryInterface.addColumn(tablename, 'ai_type', Sequelize.TEXT),
			//     queryInterface.addColumn(tablename, 'joint_capability_area', Sequelize.TEXT),
			//     queryInterface.addColumn(tablename, 'ai_role_description', Sequelize.TEXT),
			//     queryInterface.addColumn(tablename, 'ai_type_description', Sequelize.TEXT)
			// ]);
		});
	},

	down: async (queryInterface, Sequelize) => {
		return queryInterface.sequelize.transaction(function () {
			// return Promise.all([
			// queryInterface.removeColumn(tablename, 'jaic_review_status'),
			// queryInterface.removeColumn(tablename, 'service_review_status'),
			// queryInterface.removeColumn(tablename, 'poc_review_status'),
			// queryInterface.removeColumn(tablename, 'jaic_reviewer'),
			// queryInterface.removeColumn(tablename, 'service_reviewer'),
			// queryInterface.removeColumn(tablename, 'poc_reviewer'),
			// queryInterface.removeColumn(tablename, 'other_mission_partners'),
			// queryInterface.removeColumn(tablename, 'service_reviewer_notes'),
			// queryInterface.removeColumn(tablename, 'dollars_attributed_category'),
			// queryInterface.removeColumn(tablename, 'dollars_attributed'),
			// queryInterface.removeColumn(tablename, 'percentage_attributed_category'),
			// queryInterface.removeColumn(tablename, 'percentage_attributed'),
			// queryInterface.removeColumn(tablename, 'ai_type'),
			// queryInterface.removeColumn(tablename, 'joint_capability_area'),
			// queryInterface.removeColumn(tablename, 'ai_role_description'),
			// queryInterface.removeColumn(tablename, 'ai_type_description'),
			// queryInterface.addColumn(tablename, 'rev_review_stat', Sequelize.TEXT),
			// queryInterface.addColumn(tablename, 'secrev_notes', Sequelize.TEXT),
			// queryInterface.addColumn(tablename, 'secrev_review_stat', Sequelize.TEXT)
			// ]);
		});
	},
};
