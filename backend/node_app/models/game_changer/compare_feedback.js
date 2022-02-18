'use strict';
module.exports = (sequelize, DataTypes) => {
	const COMPARE_FEEDBACK = sequelize.define('compare_feedback',
		{
			id: {
				type: DataTypes.INTEGER,
				autoIncrement: true,
				primaryKey: true,
			},
			searchedParagraph: {
				type: DataTypes.TEXT,
				allowNull: false
			},
			matchedParagraphId: {
				type: DataTypes.TEXT,
				allowNull: false
			},
			docId: {
				type: DataTypes.TEXT,
				allowNull: false
			},
			positiveFeedback: {
				type: DataTypes.BOOLEAN,
				allowNull: true
			},
			userId: {
				type: DataTypes.TEXT,
				allowNull: false
			}
		},
		{
			freezeTableName: true,
			tableName: 'compare_feedback',
			timestamps: true
		}
	);
	return COMPARE_FEEDBACK;
};
