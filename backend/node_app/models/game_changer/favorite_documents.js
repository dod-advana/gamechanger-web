'use strict';
module.exports = (sequelize, DataTypes) => {
	const FAVORITE_DOCUMENT = sequelize.define('favorite_documents',
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
			filename: {
				type: DataTypes.TEXT,
				allowNull: false
			},
			favorite_name: {
				type: DataTypes.TEXT,
				allowNull: true
			},
			favorite_summary: {
				type: DataTypes.TEXT,
				allowNull: true
			},
			search_text: {
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
			tableName: 'favorite_documents',
			timestamps: true
		}
	);
	return FAVORITE_DOCUMENT;
};
