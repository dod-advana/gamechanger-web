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
			}
		},
		{
			freezeTableName: true,
			tableName: 'responsibility_reports',
			timestamps: true
		}
	);
	return RESPONSIBILITY_REPORTS;
};
