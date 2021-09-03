'use strict';
module.exports = (sequelize, DataTypes) => {
	const RDOC= sequelize.define('rdoc',
		{
            Budget_Year: {
                type: DataTypes.TEXT,
            },
            Budget_Cycle: {
                type: DataTypes.TEXT,
            },
            // Submission_Date: {
            //     type: DataTypes.TEXT,
            // },
            Service__Agency_Name: {
                type: DataTypes.TEXT,
            },
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
            Program_Element: {
                type: DataTypes.TEXT,
            },
            Program_Element_Title: {
                type: DataTypes.TEXT,
            },
            Program_Element_Notes: {
                type: DataTypes.TEXT,
            },
            PE_Mission_Description_and_Budget_Justification: {
                type: DataTypes.TEXT,
            },
            Project: {
                type: DataTypes.TEXT,
            },
            Project_Title: {
                type: DataTypes.TEXT,
            },
            Project_Mission_Description: {
                type: DataTypes.TEXT,
            },
            Prior_Year_Amount: {
                type: DataTypes.TEXT,
            },
            Current_Year_Amount: {
                type: DataTypes.TEXT,
            },
            Budget_Year_1: {
                type: DataTypes.TEXT,
            },
            Budget_Year_2: {
                type: DataTypes.TEXT,
            },
            Budget_Year_3: {
                type: DataTypes.TEXT,
            },
            Budget_Year_4: {
                type: DataTypes.TEXT,
            },
            Budget_Year_5: {
                type: DataTypes.TEXT,
            },
            To_Complete: {
                type: DataTypes.TEXT,
            },
            Total_Cost: {
                type: DataTypes.TEXT,
            },
            Project_Notes: {
                type: DataTypes.TEXT,
            },
            Project_Aquisition_Strategy: {
                type: DataTypes.TEXT,
            },
            Project_Perfromance_Metircs: {
                type: DataTypes.TEXT,
            },
            Other_program_funding_summary_remarks: {
                type: DataTypes.TEXT,
            },
            Program_Element_Title_Map: {
                type: DataTypes.TEXT,
            },
            Program_Element_Title_Count: {
                type: DataTypes.TEXT,
            },
            PE_Mission_Description_and_Budget_Justification_Map: {
                type: DataTypes.TEXT,
            },
            PE_Mission_Description_and_Budget_Justification_Count: {
                type: DataTypes.TEXT,
            },
            Project_Title_Map: {
                type: DataTypes.TEXT,
            },
            Project_Title_Count: {
                type: DataTypes.TEXT,
            },
            Project_Mission_Description_Map: {
                type: DataTypes.TEXT,
            },
            Project_Mission_Description_Count: {
                type: DataTypes.TEXT,
            },
            Project_Notes_Map: {
                type: DataTypes.TEXT,
            },
            Project_Notes_Count: {
                type: DataTypes.TEXT,
            },
            // Project_Aquisition_Strategy_Map: {
            //     type: DataTypes.TEXT,
            // },
            Project_Aquisition_Strategy_Count: {
                type: DataTypes.TEXT,
            },
            Project_Perfromance_Metircs_Map: {
                type: DataTypes.TEXT,
            },
            Project_Perfromance_Metircs_Count: {
                type: DataTypes.TEXT,
            },
            Other_program_funding_summary_remarks_Map: {
                type: DataTypes.TEXT,
            },
            // id: {
            //     type: DataTypes.TEXT,
            // },
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
            adj_core_ai_label: {
                type: DataTypes.TEXT,
            },
		},{
            freezeTableName: true,
			timestamps: false,
            tableName: 'rdoc'
		}
    );
	return RDOC;
};
