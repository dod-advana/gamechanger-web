'use strict';
module.exports = (sequelize, DataTypes) => {
	const RESPONSIBILITIES = sequelize.define('app_settings',
		{
			id: {
				type: DataTypes.INTEGER,
				autoIncrement: true,
				primaryKey: true,
			},
			key: {
				type: DataTypes.STRING,
				allowNull: false
			},
			value: {
				type: DataTypes.TEXT,
				allowNull: false
			},
		},
		{
			freezeTableName: true,
			tableName: 'app_settings',
			timestamps: false
		}
	);
	return RESPONSIBILITIES;
};
