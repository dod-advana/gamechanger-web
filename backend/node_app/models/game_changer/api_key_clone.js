'use strict';

module.exports = (sequelize, DataTypes) => {
	const API_KEY_CLONE = sequelize.define('api_key_clone',
		{
			id: {
				type: DataTypes.INTEGER,
				autoIncrement: true,
				primaryKey: true,
			}
        },
		{
			freezeTableName: true,
			tableName: 'api_key_clones',
			timestamps: true
		},
		{
			classMethods: {
				associate: (models) => {
					models.API_KEY.belongsToMany(models.CLONE_META, { through: API_KEY_CLONE, foreignKey: 'apiKeyId' })
					models.CLONE_META.belongsToMany(models.API_KEY, { thtough: API_KEY_CLONE, foreignKey: 'cloneId' });
				},
			}
		}
	);
	return API_KEY_CLONE;
};
