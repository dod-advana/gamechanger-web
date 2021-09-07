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
                references: {
                    model: 'api_key_requests',
                    key: 'id'
                  },
                  onUpdate: 'cascade',
                  onDelete: 'cascade'
			},
			cloneId: {
				allowNull: false,
				type: DataTypes.INTEGER,
                references: {
                    model: 'clone_meta',
                    key: 'id'
                  },
                  onUpdate: 'cascade',
                  onDelete: 'cascade'
			},
        },
		{
			freezeTableName: true,
			tableName: 'api_key_request_clones',
			timestamps: true
		},
		{
			classMethods: {
				associate: (models) => {
					models.API_KEY_REQUEST.belongsToMany(models.CLONE_META, { through: API_KEY_REQUEST_CLONE, foreignKey: 'apiKeyRequestId'})
					models.CLONE_META.belongsToMany(models.API_KEY_REQUEST, { thtough: API_KEY_REQUEST_CLONE, foreignKey: 'cloneId'});
				},
			}
		}
	);
	return API_KEY_REQUEST_CLONE;
};
