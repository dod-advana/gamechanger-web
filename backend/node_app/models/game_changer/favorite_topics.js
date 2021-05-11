'use strict';
module.exports = (sequelize, DataTypes) => {
	const FAVORITE_TOPICS = sequelize.define('favorite_topics',
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
			topic_name: {
				type: DataTypes.TEXT,
				allowNull: false
			},
			topic_summary: {
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
			tableName: 'favorite_topics',
			timestamps: true
		}
	);
	return FAVORITE_TOPICS;
};
