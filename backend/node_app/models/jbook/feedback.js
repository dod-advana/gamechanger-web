'use strict';
const { Sequelize } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
	return sequelize.define(
		'feedback_jbook',
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
			createdAt: {
				allowNull: false,
				type: DataTypes.DATE,
				defaultValue: Sequelize.fn('NOW'),
			},
		},
		{
			freezeTableName: true,
			timestamps: false,
			tableName: 'feedback',
		}
	);
};
