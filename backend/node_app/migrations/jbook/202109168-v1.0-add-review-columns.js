'use strict';
const tablename = 'review';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		return queryInterface.sequelize.transaction(function () {
			Promise.all([
				queryInterface.addColumn(tablename, 'jaic_review_status', Sequelize.TEXT),
				queryInterface.addColumn(tablename, 'service_review_status', Sequelize.TEXT),
				queryInterface.addColumn(tablename, 'poc_review_status', Sequelize.TEXT),
				queryInterface.addColumn(tablename, 'jaic_reviewer', Sequelize.TEXT),
				queryInterface.addColumn(tablename, 'service_reviewer', Sequelize.TEXT),
				queryInterface.addColumn(tablename, 'poc_reviewer', Sequelize.TEXT),
				queryInterface.addColumn(tablename, 'other_mission_partners', Sequelize.TEXT),
				queryInterface.addColumn(tablename, 'service_reviewer_notes', Sequelize.TEXT),
				queryInterface.addColumn(tablename, 'dollars_attributed_category', Sequelize.TEXT),
				queryInterface.addColumn(tablename, 'dollars_attributed', Sequelize.TEXT),
				queryInterface.addColumn(tablename, 'percentage_attributed_category', Sequelize.TEXT),
				queryInterface.addColumn(tablename, 'percentage_attributed', Sequelize.TEXT),
				queryInterface.addColumn(tablename, 'ai_type', Sequelize.TEXT),
				queryInterface.addColumn(tablename, 'joint_capability_area', Sequelize.TEXT),
				queryInterface.addColumn(tablename, 'ai_role_description', Sequelize.TEXT),
				queryInterface.addColumn(tablename, 'ai_type_description', Sequelize.TEXT),
				queryInterface.removeColumn(tablename, 'doc_id', Sequelize.TEXT)
			]);
		});
	},

	down: async (queryInterface, Sequelize) => {
		return queryInterface.sequelize.transaction(function () {
			return Promise.all([
				queryInterface.removeColumn(tablename, 'jaic_review_status', Sequelize.TEXT),
				queryInterface.removeColumn(tablename, 'service_review_status', Sequelize.TEXT),
				queryInterface.removeColumn(tablename, 'poc_review_status', Sequelize.TEXT),
				queryInterface.removeColumn(tablename, 'jaic_reviewer', Sequelize.TEXT),
				queryInterface.removeColumn(tablename, 'service_reviewer', Sequelize.TEXT),
				queryInterface.removeColumn(tablename, 'poc_reviewer', Sequelize.TEXT),
				queryInterface.removeColumn(tablename, 'other_mission_partners', Sequelize.TEXT),
				queryInterface.removeColumn(tablename, 'service_reviewer_notes', Sequelize.TEXT),
				queryInterface.removeColumn(tablename, 'dollars_attributed_category', Sequelize.TEXT),
				queryInterface.removeColumn(tablename, 'dollars_attributed', Sequelize.TEXT),
				queryInterface.removeColumn(tablename, 'percentage_attributed_category', Sequelize.TEXT),
				queryInterface.removeColumn(tablename, 'percentage_attributed', Sequelize.TEXT),
				queryInterface.removeColumn(tablename, 'ai_type', Sequelize.TEXT),
				queryInterface.removeColumn(tablename, 'joint_capability_area', Sequelize.TEXT),
				queryInterface.removeColumn(tablename, 'ai_role_description', Sequelize.TEXT),
				queryInterface.removeColumn(tablename, 'ai_type_description', Sequelize.TEXT),
				queryInterface.addColumn(tablename, 'doc_id', Sequelize.TEXT),
			]);
		});
	}
};
