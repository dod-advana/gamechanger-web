'use strict';
const { Sequelize } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
	return sequelize.define(
		'public_portfolio_requests',
		{
			id: {
				type: DataTypes.INTEGER,
				autoIncrement: true,
				primaryKey: true,
				allowNull: false,
			},
			creator: {
				type: DataTypes.INTEGER,
			},
			portfolio_name: {
				type: DataTypes.TEXT,
			},
			justification: {
				type: DataTypes.TEXT,
			},
			request_date: {
				allowNull: false,
				type: DataTypes.DATE,
				defaultValue: Sequelize.fn('NOW'),
			},
		},
		{
			freezeTableName: true,
			timestamps: false,
			tableName: 'public_portfolio_requests',
		}
	);
};
