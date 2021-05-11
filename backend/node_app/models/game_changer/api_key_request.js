'use strict';

module.exports = (sequelize, DataTypes) => {
	const API_KEY_REQUEST = sequelize.define('api_key_request',
		{
			id: {
				type: DataTypes.INTEGER,
				autoIncrement: true,
				primaryKey: true,
			},
			username: {
				type: DataTypes.TEXT,
				unique: false
			},
			name: {
				type: DataTypes.TEXT,
				unique: false
			},
			email: {
				type: DataTypes.TEXT,
				unique: false
			},
			reason: {
				type: DataTypes.TEXT,
				unique: false
			},
			approved: {
				type: DataTypes.BOOLEAN,
				unique: false
			},
			rejected: {
				type: DataTypes.BOOLEAN,
				unique: false
			},
		},
		{
			freezeTableName: true,
			tableName: 'api_key_requests',
			timestamps: true
		}
	);
	return API_KEY_REQUEST;
};
