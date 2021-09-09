'use strict';

module.exports = (sequelize, DataTypes) => {
	const API_KEY_CLONE = sequelize.define('api_key_clone',
		{
			id: {
				type: DataTypes.INTEGER,
				autoIncrement: true,
				primaryKey: true,
			}, 
            apiKeyId: {
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
			tableName: 'api_key_clones',
			timestamps: true
		}
	);
	return API_KEY_CLONE;
};
