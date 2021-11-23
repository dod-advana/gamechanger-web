'use strict';
module.exports = (sequelize, DataTypes) => {
	const RESPONSIBILITY_REPORTS = sequelize.define('responsibility_report',
		{
			id: {
				type: DataTypes.INTEGER,
				autoIncrement: true,
				primaryKey: true,
			},
			responsibility_id: {
				type: DataTypes.INTEGER,
				allowNull: false
			},
			reporter_hashed_username: {
				type: DataTypes.TEXT,
				allowNull: false
			},
			issue_description: {
				type: DataTypes.TEXT,
				allowNull: false
			},
			updatedColumn: {
				type: DataTypes.TEXT,
				allowNull: false
			},
			updatedText: {
				type: DataTypes.TEXT,
				allowNull: true
			},
			textPosition: {
				type: DataTypes.JSON,
				allowNull: true
			}
		},
		{
			freezeTableName: true,
			tableName: 'responsibility_reports',
			timestamps: true
		}
	);

	RESPONSIBILITY_REPORTS.associate = (models) => {
		RESPONSIBILITY_REPORTS.belongsTo(models.responsibilities, { 
			foreignKey: 'responsibility_id'
		})
	}

	return RESPONSIBILITY_REPORTS;
};
