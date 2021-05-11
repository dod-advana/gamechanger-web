'use strict';
module.exports = (sequelize, DataTypes) => {
	const user_app_versions = sequelize.define('user_app_versions',
		{
			id: {
				type: DataTypes.INTEGER,
				allowNull: false,
				primaryKey: true,
				autoIncrement: true
            },
            username: {
                type: DataTypes.STRING,
                allowNull: false
            },
			app_name: {
                type: DataTypes.STRING,
                allowNull: false
            },
            version: {
                type: DataTypes.STRING,
                allowNull: false
            }
		},
        {
			freezeTableName: true,
			tableName: 'user_app_versions',
			timestamps: false
		}
	);
	return user_app_versions;
};