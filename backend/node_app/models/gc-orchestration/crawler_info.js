'use strict';

module.exports = (sequelize, DataTypes) => {
	const Admin = sequelize.define('crawler_info',
		{
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: DataTypes.INTEGER
			},
      crawler: {
				type: DataTypes.STRING,
				allowNull: false
			},
			display_org: {
				type: DataTypes.STRING,
				allowNull: false
			},
			display_source_s: {
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
		},{
			freezeTableName: true,
			tableName: 'crawler_info',
			timestamps: false
		});
	return Admin;
};
