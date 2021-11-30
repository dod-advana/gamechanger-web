'use strict';
module.exports = (sequelize, DataTypes) => {
	const GC_USER = sequelize.define('gc_user',
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
				type: DataTypes.TEXT
			},
			last_name: {
				type: DataTypes.TEXT
			},
			email: {
				type: DataTypes.TEXT
			},
			organization: {
				type: DataTypes.TEXT
			},
			is_beta: {
				type: DataTypes.BOOLEAN,
				defaultValue: false
			},
			is_admin: {
				type: DataTypes.BOOLEAN,
				defaultValue: false
			},
			notifications: {
				type: DataTypes.JSONB
			},
			user_info: {
				type: DataTypes.JSONB
			},
			submitted_info: {
				type: DataTypes.BOOLEAN
			},
			api_requests:{
				type: DataTypes.INTEGER
			}
		},
		{
			freezeTableName: true,
			tableName: 'gc_users',
			timestamps: true
		}
	);
	return GC_USER;
};