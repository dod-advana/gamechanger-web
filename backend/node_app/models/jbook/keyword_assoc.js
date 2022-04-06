'use strict';
module.exports = (sequelize, DataTypes) => {
	const KEYWORD = sequelize.define(
		'keyword_assoc',
		{
			id: {
				type: DataTypes.INTEGER,
				autoIncrement: true,
				primaryKey: true,
			},
			keyword_id: {
				type: DataTypes.INTEGER,
			},
			pdoc_id: {
				type: DataTypes.INTEGER,
			},
			rdoc_id: {
				type: DataTypes.INTEGER,
			},
			om_id: {
				type: DataTypes.INTEGER,
			},
			accomp_id: {
				type: DataTypes.INTEGER,
			},
		},
		{
			freezeTableName: true,
			timestamps: false,
			tableName: 'keyword_assoc',
		}
	);
	return KEYWORD;
};
