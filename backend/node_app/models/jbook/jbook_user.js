'use strict';
module.exports = (sequelize, DataTypes) => {
	return sequelize.define(
		'jbook_user',
		{
			id: {
				type: DataTypes.INTEGER,
				autoIncrement: true,
				primaryKey: true,
			},
			user_id: {
				type: DataTypes.TEXT,
				unique: true,
			},
			first_name: {
				type: DataTypes.TEXT,
			},
			last_name: {
				type: DataTypes.TEXT,
			},
			organization: {
				type: DataTypes.TEXT,
			},
			email: {
				type: DataTypes.TEXT,
			},
			is_primary_reviewer: {
				type: DataTypes.BOOLEAN,
				defaultValue: false,
			},
			is_service_reviewer: {
				type: DataTypes.BOOLEAN,
				defaultValue: false,
			},
			is_poc_reviewer: {
				type: DataTypes.BOOLEAN,
				defaultValue: false,
			},
			is_admin: {
				type: DataTypes.BOOLEAN,
				defaultValue: false,
			},
			phone_number: {
				type: DataTypes.TEXT,
			},
			sub_office: {
				type: DataTypes.TEXT,
			},
			country: {
				type: DataTypes.TEXT,
			},
			state: {
				type: DataTypes.TEXT,
			},
			city: {
				type: DataTypes.TEXT,
			},
			job_title: {
				type: DataTypes.TEXT,
			},
			preferred_name: {
				type: DataTypes.TEXT,
			},
		},
		{
			freezeTableName: true,
			timestamps: false,
			tableName: 'users',
		}
	);
};
