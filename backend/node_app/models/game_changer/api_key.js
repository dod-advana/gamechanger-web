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
			},
			description: {
				type: DataTypes.TEXT
			}
		},
		{
			freezeTableName: true,
			tableName: 'api_keys',
			timestamps: true
		}
	);

	API_KEY.associate = (models) => {
		API_KEY.belongsToMany(models.clone_meta, { 
			through: 'api_key_clone', 
			foreignKey: 'apiKeyId'
		})
	}

	return API_KEY;
};
