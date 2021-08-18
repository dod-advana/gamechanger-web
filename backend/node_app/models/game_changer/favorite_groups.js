'use strict'
module.exports = (sequelize, DataTypes) => {
	const FAVORITE_GROUP = sequelize.define('favorite_groups',
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
			group_type: {
				type: DataTypes.TEXT,
				allowNull: true
			},
			group_name: {
				type: DataTypes.TEXT,
				allowNull: true
			},
			group_description: {
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
			tableName: 'favorite_groups',
			timestamps: true
		}
	);

	// FAVORITE_GROUP.associate = (models) => {
	// 	FAVORITE_GROUP.belongsToMany(models.FAVORITE_DOCUMENT, {
	// 		through: models.FAVORITE_DOCUMENTS_GROUP,
	// 		foreignKey: "favorite_group_id",
	// 	});
	// };

	return FAVORITE_GROUP;
};
