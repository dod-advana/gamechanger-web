'use strict';
module.exports = (sequelize, DataTypes) => {
	return sequelize.define('user_request',
		{
			id: {
				type: DataTypes.INTEGER,
				autoIncrement: true,
				primaryKey: true,
			},
			email: {
				type: DataTypes.TEXT,
				unique: true,
			},
			organization: {
				type: DataTypes.TEXT,
				unique: false,
			},
			phone_number: {
				type: DataTypes.TEXT,
				unique: false,
			},
			is_activated: {
				type: DataTypes.BOOLEAN,
				defaultValue: false
			}
		}, {
			freezeTableName: true,
			timestamps: false,
			tableName: 'user_requests'
		}
	);
};
