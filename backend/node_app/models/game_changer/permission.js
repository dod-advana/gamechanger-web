'use strict';
module.exports = (Sequelize, DataTypes) => {
	const Permission = Sequelize.define('permission',
		{
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: DataTypes.INTEGER,
			},
			name: {
				type: DataTypes.STRING,
				unique: true
			}
		},
		{
			classMethods: {
				associate: (models) => {
					Permission.belongsToMany(models.role, { through: models.roleperm, foreignKey: 'permissionid' });
				},
			}
		}
	);
	return Permission;
};
