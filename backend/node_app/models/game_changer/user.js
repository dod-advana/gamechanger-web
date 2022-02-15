'use strict';
module.exports = (sequelize, DataTypes) => {
	const User = sequelize.define('user',
		{
			id: {
				type: DataTypes.INTEGER,
				autoIncrement: true,
				primaryKey: true,
			},
			user_id: {
				type: DataTypes.TEXT,
				unique: true,
			},
			cn: {
				type: DataTypes.TEXT
			},
			first_name: {
				type: DataTypes.TEXT
			},
			last_name: {
				type: DataTypes.TEXT
			},
			organization: {
				type: DataTypes.TEXT
			},
			email: {
				type: DataTypes.TEXT
			},
			phone_number: {
				type: DataTypes.TEXT
			},
			sub_office: {
				type: DataTypes.TEXT
			},
			country: {
				type: DataTypes.TEXT
			},
			state: {
				type: DataTypes.TEXT
			},
			city: {
				type: DataTypes.TEXT
			},
			job_title: {
				type: DataTypes.TEXT
			},
			preferred_name: {
				type: DataTypes.TEXT
			},
			extra_fields: {
				type: DataTypes.JSONB
			},
			is_super_admin: {
				type: DataTypes.BOOLEAN,
				defaultValue: false
			},
		},
		{
			freezeTableName: true,
			tableName: 'users',
			timestamps: false
		}
		// {
		// 	classMethods: {
		// 		associate: (models) => {
		// 			User.hasMany(models.user_app_versions, { foreignKey: 'username' })
		// 			User.hasMany(models.userrole, { foreignKey: 'userid' });
		// 			User.belongsToMany(models.role, { through: models.userrole, foreignKey: 'userid' });
		// 			User.hasMany(models.darq_group_user, { foreignKey: 'user_id' });
		// 			User.belongsToMany(models.darq_group, { through: models.darq_group_user, foreignKey: 'user_id' });
		// 		},
		// 	}
		// }
	);
	return User;
};
