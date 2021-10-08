'use strict';

module.exports = (sequelize, DataTypes) => {
	const Admin = sequelize.define('crawler_info',
		{
			crawler: {
			type: DataTypes.STRING,
			primaryKey: true,
			allowNull: false
			},
			display_org: {
				type: DataTypes.STRING,
				allowNull: false
			},
			data_source_s: {
				type: DataTypes.STRING,
				allowNull: false
			},
			source_title: {
				type: DataTypes.STRING,
				allowNull: false
			},
			url_origin: {
				type: DataTypes.STRING,
				allowNull: false
			},
			image_link: {
				type: DataTypes.STRING,
				allowNull: false
			},
			data_source_s: {
				type: DataTypes.STRING,
				allowNull: false
			}		
		},{
			freezeTableName: true,
			tableName: 'crawler_info',
			timestamps: false
		});
	return Admin;
};
