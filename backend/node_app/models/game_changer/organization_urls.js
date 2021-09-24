'use strict';

module.exports = (sequelize, DataTypes) => {
	const ORGANIZATION_URLS = sequelize.define('organization_urls',
		{
			id: {
				type: DataTypes.INTEGER,
				autoIncrement: true,
				primaryKey: true,
			},
			org_name: {
				type: DataTypes.STRING,
				primaryKey: true,
				allowNull: false
			},
			image_url: {
				type: DataTypes.STRING,
				allowNull: false
			}
		}, {
			freezeTableName: true,
			tableName: 'organization_urls',
			timestamps: false
		});
	return ORGANIZATION_URLS;
};
