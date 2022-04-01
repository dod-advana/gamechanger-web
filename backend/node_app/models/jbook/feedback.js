'use strict';
module.exports = (sequelize, DataTypes) => {
	const FEEDBACK = sequelize.define(
		'feedback',
		{
			id: {
				type: DataTypes.INTEGER,
				autoIncrement: true,
				primaryKey: true,
				allowNull: false,
			},
			first_name: {
				type: DataTypes.TEXT,
			},
			last_name: {
				type: DataTypes.TEXT,
			},
			email: {
				type: DataTypes.TEXT,
			},
			type: {
				type: DataTypes.TEXT,
			},
			description: {
				type: DataTypes.TEXT,
			},
		},
		{
			freezeTableName: true,
			timestamps: false,
			tableName: 'feedback',
		}
	);
	return FEEDBACK;
};
