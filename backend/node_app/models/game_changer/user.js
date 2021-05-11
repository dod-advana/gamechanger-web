'use strict';
module.exports = (sequelize, DataTypes) => {
	const User = sequelize.define('user',
		{
			id: {
				type: DataTypes.INTEGER,
				autoIncrement: true,
				primaryKey: true,
			},
			username: {
				type: DataTypes.TEXT,
				unique: true
			},
			displayname: DataTypes.TEXT,
			email: DataTypes.TEXT,
			lastlogin: DataTypes.DATE,
			sandbox_id: DataTypes.INTEGER,
			disabled: {
				type: DataTypes.BOOLEAN,
				defaultValue: false
			},
			session_id: {
				type: DataTypes.TEXT
			},
			subAgency: {
				type: DataTypes.TEXT,
				field: 'sub_agency',
			},
			extra_fields: DataTypes.JSONB,
		},
		{
			classMethods: {
				associate: (models) => {
					User.hasMany(models.user_app_versions, { foreignKey: 'username' })
					User.hasMany(models.userrole, { foreignKey: 'userid' });
					User.belongsToMany(models.role, { through: models.userrole, foreignKey: 'userid' });
					User.hasMany(models.darq_group_user, { foreignKey: 'user_id' });
					User.belongsToMany(models.darq_group, { through: models.darq_group_user, foreignKey: 'user_id' });
				},
			}
		}
	);
	return User;
};
