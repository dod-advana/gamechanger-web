'use strict';
module.exports = (sequelize, DataTypes) => {
	return sequelize.define(
		'comments',
		{
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: DataTypes.INTEGER,
			},
			docID: {
				allowNull: false,
				type: DataTypes.TEXT,
			},
			portfolioName: {
				allowNull: false,
				type: DataTypes.TEXT,
			},
			message: {
				allowNull: false,
				type: DataTypes.TEXT,
			},
			author: {
				type: DataTypes.TEXT,
			},
			createdAt: {
				type: DataTypes.DATE,
				allowNull: false,
			},
			updatedAt: {
				type: DataTypes.DATE,
				allowNull: false,
			},
			upvotes: {
				type: DataTypes.ARRAY(DataTypes.INTEGER),
			},
			downvotes: {
				type: DataTypes.ARRAY(DataTypes.INTEGER),
			},
			deleted: {
				type: DataTypes.BOOLEAN,
				default: false,
			},
		},
		{
			freezeTableName: true,
			timestamps: true,
			tableName: 'comments',
		}
	);
};
