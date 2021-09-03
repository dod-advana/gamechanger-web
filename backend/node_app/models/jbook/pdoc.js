'use strict';
module.exports = (sequelize, DataTypes) => {
	const PDOC= sequelize.define('pdoc',
		{
            Service__Agency: {
                type: DataTypes.TEXT,
            },
            Position: {
                type: DataTypes.TEXT,
            },
            Position_Year: {
                type: DataTypes.TEXT,
            },
            // PB_Submission_Date: {
            //     type: DataTypes.TEXT,
            // },
            Appropriation: {
                type: DataTypes.TEXT,
            },
            Appropriation_Title: {
                type: DataTypes.TEXT,
            },
            Budget_Activity: {
                type: DataTypes.TEXT,
            },
            Budget_Activity_Title: {
                type: DataTypes.TEXT,
            },
            Budget_Line_Item: {
                type: DataTypes.TEXT,
            },
            Budget_Line_Item_Title: {
                type: DataTypes.TEXT,
            },
            P1_Line_Number: {
                type: DataTypes.TEXT,
            },
            All_Prior_Years_Amt: {
                type: DataTypes.TEXT,
            },
            Prior_Year_Amt: {
                type: DataTypes.TEXT,
            },
            Current_Year_Amt: {
                type: DataTypes.TEXT,
            },
            Budget_Year_1_Total: {
                type: DataTypes.TEXT,
            },
            Budget_Year_2_Total: {
                type: DataTypes.TEXT,
            },
            Budget_Year_3_Total: {
                type: DataTypes.TEXT,
            },
            Budget_Year_4_Total: {
                type: DataTypes.TEXT,
            },
            Budget_Year_5_Total: {
                type: DataTypes.TEXT,
            },
            To_Complete: {
                type: DataTypes.TEXT,
            },
            Total: {
                type: DataTypes.TEXT,
            },
            Program_Description: {
                type: DataTypes.TEXT,
            },
            Budget_Justification: {
                type: DataTypes.TEXT,
            },
            Program_Element: {
                type: DataTypes.TEXT,
            },
            Program_Description_Map: {
                type: DataTypes.TEXT,
            },
            Program_Description_Count: {
                type: DataTypes.TEXT,
            },
            Budget_Justification_Map: {
                type: DataTypes.TEXT,
            },
            Budget_Justification_Count: {
                type: DataTypes.TEXT,
            },
            core_ai_label: {
                type: DataTypes.TEXT,
            },
            jaic_review_stat: {
                type: DataTypes.TEXT,
            },
            jaic_review_notes: {
                type: DataTypes.TEXT,
            },
            reviewer: {
                type: DataTypes.TEXT,
            },
            source_tag: {
                type: DataTypes.TEXT,
            },
            planned_trans_part: {
                type: DataTypes.TEXT,
            },
            current_msn_part: {
                type: DataTypes.TEXT,
            },
            service_review: {
                type: DataTypes.TEXT,
            },
            dj_core_ai_label: {
                type: DataTypes.TEXT,
            }
		},{
            freezeTableName: true,
			timestamps: false,
            tableName: 'pdoc'
		}
    );
	return PDOC;
};
