'use strict';

const tablename = 'review';

module.exports = {
  up: (queryInterface, Sequelize) => {
		return queryInterface.sequelize.transaction(function () {
			Promise.all([
        queryInterface.renameColumn(tablename, 'rev_core_ai_label', 'primary_class_label'),
        queryInterface.renameColumn(tablename, 'jaic_review_status', 'primary_review_status'),
        queryInterface.renameColumn(tablename, 'review_notes', 'primary_review_notes'),
        queryInterface.renameColumn(tablename, 'jaic_reviewer', 'primary_reviewer'),
        queryInterface.renameColumn(tablename, 'rev_ptp', 'primary_ptp'),
        queryInterface.renameColumn(tablename, 'rev_mp_list', 'primary_mp_list'),

        queryInterface.renameColumn(tablename, 'rev_agree_label', 'service_agree_label'),
        queryInterface.renameColumn(tablename, 'rev_trans_known', 'service_trans_known'),
        queryInterface.renameColumn(tablename, 'rev_trans_type', 'service_trans_type'),
        queryInterface.renameColumn(tablename, 'rev_mp_add', 'service_mp_add'),
        queryInterface.renameColumn(tablename, 'poc_title', 'service_poc_title'),
        queryInterface.renameColumn(tablename, 'poc_name', 'service_poc_name'),
        queryInterface.renameColumn(tablename, 'poc_email', 'service_poc_email'),
        queryInterface.renameColumn(tablename, 'poc_org', 'service_poc_org'),
        queryInterface.renameColumn(tablename, 'service_reviewer_notes', 'service_review_notes'),

        queryInterface.renameColumn(tablename, 'dollars_attributed_category', 'poc_dollars_attributed_category'),
        queryInterface.renameColumn(tablename, 'dollars_attributed', 'poc_dollars_attributed'),
        queryInterface.renameColumn(tablename, 'percentage_attributed_category', 'poc_percentage_attributed_category'),
        queryInterface.renameColumn(tablename, 'percentage_attributed', 'poc_percentage_attributed'),
        queryInterface.renameColumn(tablename, 'ai_type', 'poc_ai_type'),
        queryInterface.renameColumn(tablename, 'joint_capability_area', 'poc_joint_capability_area'),
        queryInterface.renameColumn(tablename, 'ai_role_description', 'poc_ai_role_description'),
        queryInterface.renameColumn(tablename, 'ai_type_description', 'poc_ai_type_description'),
        queryInterface.renameColumn(tablename, 'rev_review_stat', 'review_status'),

        queryInterface.addColumn(tablename, 'createdAt', {
          type: Sequelize.DATE,
          defaultValue: Sequelize.fn('NOW'),
          allowNull: false
        }),
        queryInterface.addColumn(tablename, 'updatedAt', {
          type: Sequelize.DATE,
          defaultValue: Sequelize.fn('NOW'),
          allowNull: false
        }),        
        queryInterface.addColumn(tablename, 'deletedAt', Sequelize.DATE),

        queryInterface.addColumn(tablename, 'primary_service_reviewer', Sequelize.TEXT),
        queryInterface.addColumn(tablename, 'reviewer', Sequelize.TEXT),
        queryInterface.addColumn(tablename, 'service_ptp', Sequelize.TEXT),
        queryInterface.addColumn(tablename, 'service_mp_list', Sequelize.TEXT),
        queryInterface.addColumn(tablename, 'service_class_label', Sequelize.TEXT),
        queryInterface.addColumn(tablename, 'poc_review_notes', Sequelize.TEXT),
        queryInterface.addColumn(tablename, 'service_secondary_reviewer', Sequelize.TEXT),


        queryInterface.removeColumn(tablename, 'adj_core_ai_label'),
        queryInterface.removeColumn(tablename, 'secrev_agree_label'),
        queryInterface.removeColumn(tablename, 'secrev_notes'),
        queryInterface.removeColumn(tablename, 'secrev_review_stat'),

			]);
		});
  },

  down: (queryInterface, Sequelize) => {
		return queryInterface.sequelize.transaction(function () {
			Promise.all([
        queryInterface.renameColumn(tablename, 'primary_class_label', 'rev_core_ai_label'),
        queryInterface.renameColumn(tablename, 'primary_review_status', 'jaic_review_status'),
        queryInterface.renameColumn(tablename, 'primary_review_notes', 'review_notes'),
        queryInterface.renameColumn(tablename, 'primary_reviewer', 'jaic_reviewer'),
        queryInterface.renameColumn(tablename, 'primary_ptp', 'rev_ptp'),
        queryInterface.renameColumn(tablename, 'primary_mp_list', 'rev_mp_list'),

        queryInterface.renameColumn(tablename, 'service_agree_label', 'rev_agree_label'),
        queryInterface.renameColumn(tablename, 'service_trans_known', 'rev_trans_known'),
        queryInterface.renameColumn(tablename, 'service_trans_type', 'rev_trans_type'),
        queryInterface.renameColumn(tablename, 'service_mp_add', 'rev_mp_add'),
        queryInterface.renameColumn(tablename, 'service_poc_title', 'poc_title'),
        queryInterface.renameColumn(tablename, 'service_poc_name', 'poc_name'),
        queryInterface.renameColumn(tablename, 'service_poc_email', 'poc_email'),
        queryInterface.renameColumn(tablename, 'service_poc_org', 'poc_org'),
        queryInterface.renameColumn(tablename, 'service_review_notes', 'service_reviewer_notes'),

        queryInterface.renameColumn(tablename, 'poc_dollars_attributed_category', 'dollars_attributed_category'),
        queryInterface.renameColumn(tablename, 'poc_dollars_attributed', 'dollars_attributed'),
        queryInterface.renameColumn(tablename, 'poc_percentage_attributed_category', 'percentage_attributed_category'),
        queryInterface.renameColumn(tablename, 'poc_percentage_attributed', 'percentage_attributed'),
        queryInterface.renameColumn(tablename, 'poc_ai_type', 'ai_type'),
        queryInterface.renameColumn(tablename, 'poc_joint_capability_area', 'joint_capability_area'),
        queryInterface.renameColumn(tablename, 'poc_ai_role_description', 'ai_role_description'),
        queryInterface.renameColumn(tablename, 'poc_ai_type_description', 'ai_type_description'),
        queryInterface.renameColumn(tablename, 'review_status', 'rev_review_stat'),

        queryInterface.removeColumn(tablename, 'created'),
        queryInterface.removeColumn(tablename, 'updated'),        
        queryInterface.removeColumn(tablename, 'deleted'),

        queryInterface.removeColumn(tablename, 'primary_service_reviewer'),
        queryInterface.removeColumn(tablename, 'reviewer'),
        queryInterface.removeColumn(tablename, 'service_ptp'),
        queryInterface.removeColumn(tablename, 'service_mp_list'),
        queryInterface.removeColumn(tablename, 'service_class_label'),
        queryInterface.removeColumn(tablename, 'poc_review_notes'),



        queryInterface.addColumn(tablename, 'adj_core_ai_label', Sequelize.TEXT),
        queryInterface.addColumn(tablename, 'secrev_agree_label', Sequelize.TEXT),
        queryInterface.addColumn(tablename, 'secrev_notes', Sequelize.TEXT),
        queryInterface.addColumn(tablename, 'secrev_review_stat', Sequelize.TEXT),

      ]);
		});
  }
};
