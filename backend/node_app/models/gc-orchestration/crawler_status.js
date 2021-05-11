'use strict';

module.exports = (sequelize, DataTypes) => {
	const Admin = sequelize.define('crawler_status',
		{
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: DataTypes.INTEGER
			},
			crawler_name: {
				type: DataTypes.STRING,
				allowNull: false
			},
			status: {
				type: DataTypes.STRING,
				allowNull: false
			},
			datetime: {
				type: DataTypes.DATE,
				allowNull: false
			},
		},{
			freezeTableName: true,
			tableName: 'crawler_status',
			timestamps: false
		});
	return Admin;
};
