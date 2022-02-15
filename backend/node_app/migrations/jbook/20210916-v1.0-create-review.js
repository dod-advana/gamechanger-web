'use strict';
module.exports = {
	up: (queryInterface, Sequelize) => {
		return queryInterface.createTable('review', {
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.INTEGER
			},
			doc_id: {
				type: Sequelize.TEXT
			},
			program_element: {
				type: Sequelize.TEXT
			},
			budget_line_item: {
				type: Sequelize.TEXT
			},
			rev_agree_label: {
				type: Sequelize.TEXT
			},
			rev_core_ai_label: {
				type: Sequelize.TEXT
			},
			rev_trans_known: {
				type: Sequelize.TEXT
			},
			rev_trans_type: {
				type: Sequelize.TEXT
			},
			rev_ptp: {
				type: Sequelize.TEXT
			},
			rev_mp_list: {
				type: Sequelize.TEXT
			},
			rev_mp_add: {
				type: Sequelize.TEXT
			},
			rev_review_stat: {
				type: Sequelize.TEXT
			},
			secrev_agree_label: {
				type: Sequelize.TEXT
			},
			secrev_notes: {
				type: Sequelize.TEXT
			},
			secrev_review_stat: {
				type: Sequelize.TEXT
			},
			poc_title: {
				type: Sequelize.TEXT
			},
			poc_name: {
				type: Sequelize.TEXT
			},
			poc_email: {
				type: Sequelize.TEXT
			},
			review_notes: {
				type: Sequelize.TEXT
			},
			budget_type: {
				type: Sequelize.TEXT
			},
			budget_year: {
				type: Sequelize.TEXT
			}
		});
	},
	down: (queryInterface, Sequelize) => {
		return queryInterface.dropTable('review');
	}
};