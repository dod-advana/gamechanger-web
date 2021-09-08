'use strict';
module.exports = (sequelize, DataTypes) => {
	const ALL_OUTGOING_COUNTS = sequelize.define('all_outgoing_counts_pdf_pds_xwalk_only',
		{
            pdf_filename: {
                type: DataTypes.TEXT,
            },
			pds_filename: {
                type: DataTypes.TEXT,
                primaryKey: true
            },
		},{
            freezeTableName: true,
			timestamps: false,
            schema: 'pds_parsed_validation',
            tableName: 'all_outgoing_counts_pdf_pds_xwalk_only'
		}
	);
	return ALL_OUTGOING_COUNTS;
};
