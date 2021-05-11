'use strict';

module.exports = (sequelize, DataTypes) => {
	const API_KEY = sequelize.define('api_key',
		{
			id: {
				type: DataTypes.INTEGER,
				autoIncrement: true,
				primaryKey: true,
			},
			apiKey: {
				type: DataTypes.TEXT,
				unique: true
			},
			username: {
				type: DataTypes.TEXT,
				unique: false
			},
			active: {
				type: DataTypes.BOOLEAN
			}
		},
		{
			freezeTableName: true,
			tableName: 'api_keys',
			timestamps: true
		}
	);
	return API_KEY;
};
