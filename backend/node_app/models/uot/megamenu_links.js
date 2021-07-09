'use strict';
module.exports = (sequelize, DataTypes) => {
	const MegamenuLinks = sequelize.define('megamenu_links',
		{
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: DataTypes.INTEGER,
			},
			section: {
				type: DataTypes.STRING
			},
			row_number: {
				type: DataTypes.INTEGER,
			},
			description: {
				type: DataTypes.TEXT
			},
			subsection1_label: {
				type: DataTypes.STRING
			},
			subsection2_label: {
				type: DataTypes.STRING
			},
			link_label: {
				type: DataTypes.STRING
			},
			href: {
				type: DataTypes.TEXT
			},
			chip: {
				type: DataTypes.STRING
			},
			permission: {
				type: DataTypes.STRING
			},
			link_identifier: {
				type: DataTypes.TEXT
			},
			new_tab: {
				type: DataTypes.BOOLEAN
			},
			hide_without_permission: {
				type: DataTypes.BOOLEAN
			},
			createdAt: { 
				type: DataTypes.DATE, 
				field: 'created_at' 
			},
			updatedAt: { 
				type: DataTypes.DATE, 
				field: 'updated_at' 
			},
		},
		{
			freeTableName: true,
			tableName: 'megamenu_links',
			timestamps: true,
			underscored: true
		}
	);
	return MegamenuLinks;
};