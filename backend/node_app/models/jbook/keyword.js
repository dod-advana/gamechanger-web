'use strict';
module.exports = (sequelize, DataTypes) => {
	const KEYWORD = sequelize.define('keyword',
		{
			id: {
				type: DataTypes.INTEGER,
				autoIncrement: true,
				primaryKey: true,
			},
			name: {
				type: DataTypes.TEXT,
			},
			aliases: {
				type: DataTypes.ARRAY(DataTypes.TEXT)
			}
		}, {
		freezeTableName: true,
		timestamps: false,
		tableName: 'keyword'
	}
	);
	return KEYWORD;
};
