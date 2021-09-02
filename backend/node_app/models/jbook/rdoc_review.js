'use strict';
module.exports = (sequelize, DataTypes) => {
	const RDOC_REVIEW= sequelize.define('rdoc_review',
		{
            id: {
                type: DataTypes.TEXT,
                primaryKey: true
            },
			rdoc_id: {
                type: DataTypes.TEXT
            },
            Program_Element: {
                type: DataTypes.TEXT
            },
            Budget_Line_Item: {
                type: DataTypes.TEXT
            },
            rev_agree_label: {
                type: DataTypes.TEXT
            },
            rev_core_ai_label: {
                type: DataTypes.TEXT
            },
            rev_trans_known: {
                type: DataTypes.TEXT
            },
            rev_trans_type: {
                type: DataTypes.TEXT
            },
            rev_ptp: {
                type: DataTypes.TEXT
            },
            rev_mp_list: {
                type: DataTypes.TEXT
            },
            rev_mp_add: {
                type: DataTypes.TEXT
            },
            rev_review_stat: {
                type: DataTypes.TEXT
            },
            secrev_agree_label: {
                type: DataTypes.TEXT
            },
            secrev_notes: {
                type: DataTypes.TEXT
            },
            secrev_review_stat: {
                type: DataTypes.TEXT
            },
            poc_title: {
                type: DataTypes.TEXT
            },
            poc_name: {
                type: DataTypes.TEXT
            },
            poc_email: {
                type: DataTypes.TEXT
            },
            review_notes: {
                type: DataTypes.TEXT
            }
		},{
            freezeTableName: true,
			timestamps: false,
            // schema: 'public',
            tableName: 'rdoc_review'
		}
    );
	return RDOC_REVIEW;
};
