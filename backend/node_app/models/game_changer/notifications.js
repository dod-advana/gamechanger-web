'use strict';
module.exports = (sequelize, DataTypes) => {
	const NOTIFICATIONS = sequelize.define('notifications',
		{
			id: {
				type: DataTypes.INTEGER,
				autoIncrement: true,
				primaryKey: true,
			},
			project_name: {
				type: DataTypes.TEXT
			},
			level: {
				type: DataTypes.TEXT
			},
			message: {
				type: DataTypes.TEXT
			},
			active: {
				type: DataTypes.BOOLEAN,
			}
		}, {
			freezeTableName: true,
			tableName: 'notifications',
			timestamps: false
		}
	);
	return NOTIFICATIONS;
};
