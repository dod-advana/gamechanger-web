'use strict';
module.exports = (sequelize, DataTypes) => {
	const FAVORITE_ORGANIZATIONS = sequelize.define('favorite_organizations',
		{
			id: {
				type: DataTypes.INTEGER,
				autoIncrement: true,
				primaryKey: true,
			},
			user_id: {
				type: DataTypes.TEXT,
				allowNull: false
			},
			new_user_id: {
				type: DataTypes.TEXT
			},
			organization_name: {
				type: DataTypes.TEXT,
				allowNull: false
			},
			organization_summary: {
				type: DataTypes.TEXT,
				allowNull: true
			},
			is_clone: {
				type: DataTypes.BOOLEAN,
				allowNull: false
			},
			clone_index: {
				type: DataTypes.TEXT,
				allowNull: true
			},
		},
		{
			freezeTableName: true,
			tableName: 'favorite_organizations',
			timestamps: true
		}
	);
	return FAVORITE_ORGANIZATIONS;
};
