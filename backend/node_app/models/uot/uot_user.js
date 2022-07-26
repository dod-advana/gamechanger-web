'use strict';
module.exports = (sequelize, DataTypes) => {
	const User = sequelize.define(
		'uot_user',
		{
			id: {
				type: DataTypes.INTEGER,
				autoIncrement: true,
				primaryKey: true,
			},
			username: {
				type: DataTypes.TEXT,
				unique: true,
			},
			displayname: DataTypes.TEXT,
			email: DataTypes.TEXT,
			lastlogin: DataTypes.DATE,
			sandbox_id: DataTypes.INTEGER,
			disabled: {
				type: DataTypes.BOOLEAN,
				defaultValue: false,
			},
			session_id: {
				type: DataTypes.TEXT,
			},
			subAgency: {
				type: DataTypes.TEXT,
				field: 'sub_agency',
			},
			extra_fields: DataTypes.JSONB,
			favorite_apps: {
				type: DataTypes.ARRAY(DataTypes.INTEGER),
			},
		},
		{
			tableName: 'users',
		}
	);
	User.associate = (models) => {
		User.hasMany(models.user_app_versions, { foreignKey: 'username' });
		User.hasMany(models.userrole, { foreignKey: 'userid' });
		User.belongsToMany(models.role, { through: models.userrole, foreignKey: 'userid' });
	};
	return User;
};
