'use strict';
module.exports = (sequelize, DataTypes) => {
	const REVIEW = sequelize.define(
		'review',
		{
			id: {
				type: DataTypes.INTEGER,
				autoIncrement: true,
				primaryKey: true,
				allowNull: false,
			},
			source_tag: {
				type: DataTypes.TEXT,
			},
			program_element: {
				type: DataTypes.TEXT,
			},
			budget_line_item: {
				type: DataTypes.TEXT,
			},
			service_agree_label: {
				type: DataTypes.TEXT,
			},
			primary_class_label: {
				type: DataTypes.TEXT,
			},
			service_trans_known: {
				type: DataTypes.TEXT,
			},
			// rev_trans_agree: {
			// 	type: DataTypes.TEXT
			// },
			service_trans_type: {
				type: DataTypes.TEXT,
			},
			primary_ptp: {
				type: DataTypes.TEXT,
			},
			service_ptp: {
				type: DataTypes.TEXT,
			},
			service_ptp_agree_label: {
				type: DataTypes.TEXT,
			},
			primary_mp_list: {
				type: DataTypes.TEXT,
			},
			service_mp_add: {
				type: DataTypes.TEXT,
			},
			review_status: {
				type: DataTypes.TEXT,
			},
			service_poc_title: {
				type: DataTypes.TEXT,
			},
			service_poc_name: {
				type: DataTypes.TEXT,
			},
			service_poc_email: {
				type: DataTypes.TEXT,
			},
			primary_review_notes: {
				type: DataTypes.TEXT,
			},
			budget_year: {
				type: DataTypes.TEXT,
			},
			budget_type: {
				type: DataTypes.TEXT,
			},
			primary_review_status: {
				type: DataTypes.TEXT,
			},
			service_review_status: {
				type: DataTypes.TEXT,
			},
			poc_review_status: {
				type: DataTypes.TEXT,
			},
			primary_reviewer: {
				type: DataTypes.TEXT,
			},
			service_reviewer: {
				type: DataTypes.TEXT,
			},
			poc_reviewer: {
				type: DataTypes.TEXT,
			},
			other_mission_partners: {
				type: DataTypes.TEXT,
			},
			service_review_notes: {
				type: DataTypes.TEXT,
			},
			poc_dollars_attributed_category: {
				type: DataTypes.TEXT,
			},
			poc_dollars_attributed: {
				type: DataTypes.TEXT,
			},
			poc_percentage_attributed_category: {
				type: DataTypes.TEXT,
			},
			poc_percentage_attributed: {
				type: DataTypes.TEXT,
			},
			poc_ai_type: {
				type: DataTypes.TEXT,
			},
			poc_joint_capability_area: {
				type: DataTypes.TEXT,
			},
			poc_joint_capability_area2: {
				type: DataTypes.TEXT,
			},
			poc_joint_capability_area3: {
				type: DataTypes.TEXT,
			},
			poc_ai_role_description: {
				type: DataTypes.TEXT,
			},
			poc_ai_type_description: {
				type: DataTypes.TEXT,
			},
			secondary_reviewer: {
				type: DataTypes.TEXT,
			},
			service_poc_org: {
				type: DataTypes.TEXT,
			},
			poc_phone_number: {
				type: DataTypes.TEXT,
			},
			service_class_label: {
				type: DataTypes.TEXT,
			},
			poc_review_notes: {
				type: DataTypes.TEXT,
			},
			createdAt: {
				type: DataTypes.DATE,
				allowNull: false,
			},
			updatedAt: {
				type: DataTypes.DATE,
				allowNull: false,
			},
			deletedAt: {
				type: DataTypes.DATE,
			},
			primary_service_reviewer: {
				type: DataTypes.TEXT,
			},
			// reviewer: {
			// 	type: DataTypes.TEXT
			// },
			service_mp_list: {
				type: DataTypes.TEXT,
			},
			service_secondary_reviewer: {
				type: DataTypes.TEXT,
			},
			budget_activity: {
				type: DataTypes.TEXT,
			},
			domain_task: {
				type: DataTypes.TEXT,
			},
			domain_task_secondary: {
				type: DataTypes.TEXT,
			},
			alternate_poc_title: {
				type: DataTypes.TEXT,
			},
			alternate_poc_name: {
				type: DataTypes.TEXT,
			},
			alternate_poc_email: {
				type: DataTypes.TEXT,
			},
			alternate_poc_org: {
				type: DataTypes.TEXT,
			},
			alternate_poc_phone_number: {
				type: DataTypes.TEXT,
			},
			robotics_system_agree: {
				type: DataTypes.TEXT,
			},
			poc_agree_label: {
				type: DataTypes.TEXT,
			},
			poc_class_label: {
				type: DataTypes.TEXT,
			},
			poc_ptp: {
				type: DataTypes.TEXT,
			},
			poc_ptp_agree_label: {
				type: DataTypes.TEXT,
			},
			poc_mp_list: {
				type: DataTypes.TEXT,
			},
			poc_mp_agree_label: {
				type: DataTypes.TEXT,
			},
			poc_mp_checklist: {
				type: DataTypes.TEXT,
			},
			service_mp_checklist: {
				type: DataTypes.TEXT,
			},
			intelligent_systems_agree: {
				type: DataTypes.TEXT,
			},
			appn_num: {
				type: DataTypes.TEXT,
			},
			agency: {
				type: DataTypes.TEXT,
			},
			portfolio_name: {
				type: DataTypes.TEXT,
			},
		},
		{
			freezeTableName: true,
			timestamps: true,
			tableName: 'review',
		}
	);
	return REVIEW;
};
