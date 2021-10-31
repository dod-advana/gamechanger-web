'use strict';

module.exports = (sequelize, DataTypes) => {
	const API_KEY_REQUEST_CLONE = sequelize.define('api_key_request_clone',
		{
			id: {
				type: DataTypes.INTEGER,
				autoIncrement: true,
				primaryKey: true,
			}, 
            apiKeyRequestId: {
				allowNull: false,
				type: DataTypes.INTEGER,
			},
			cloneId: {
				allowNull: false,
				type: DataTypes.INTEGER,
			},
        },
		{
			freezeTableName: true,
			tableName: 'api_key_request_clones',
			timestamps: true
		}
	);
	return API_KEY_REQUEST_CLONE;
};
