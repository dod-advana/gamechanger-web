'use strict';

module.exports = (sequelize, DataTypes) => {
	const organization_info = sequelize.define('organization_info',
		{
			org_name: {
				type: DataTypes.STRING,
				primaryKey: true,
				allowNull: false
			},
			org_acronym: {
				type: DataTypes.STRING,
				allowNull: false
			},
			image_link: {
				type: DataTypes.STRING,
				allowNull: false
			}
		},{
			freezeTableName: true,
			tableName: 'organization_info',
			timestamps: false
		});
	return organization_info;
};
