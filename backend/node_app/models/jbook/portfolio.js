'use strict';
module.exports = (sequelize, DataTypes) => {
	const PORTFOLIO = sequelize.define('portfolio',
		{
			id: {
				type: DataTypes.INTEGER,
				autoIncrement: true,
				primaryKey: true,
			},
			name: {
				type: DataTypes.TEXT,
			},
			description: {
				type: DataTypes.TEXT,
			},
			user_ids: {
				type: DataTypes.ARRAY(DataTypes.INTEGER)
			},
			tags: {
				type: DataTypes.ARRAY(DataTypes.TEXT)
			}
		}, {
			freezeTableName: true,
			timestamps: false,
			tableName: 'portfolio'
		}
	);
	return PORTFOLIO;
};
