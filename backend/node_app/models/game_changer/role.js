'use strict';
module.exports = (sequelize, DataTypes) => {
	const Role = sequelize.define('role',
		{
			id: {
				type: DataTypes.INTEGER,
				autoIncrement: true,
				primaryKey: true,
			},
			name: {
				type: DataTypes.TEXT,
				unique: true
			}
		},
		{
			classMethods: {
				associate: (models) => {
					Role.belongsToMany(models.user, { through: models.userrole, foreignKey: 'roleid' });
					Role.belongsToMany(models.permission, { through: models.roleperm, foreignKey: 'roleid' });
				},
			}
		}
	);
	return Role;
};
