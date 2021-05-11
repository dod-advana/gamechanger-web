'use strict';

const tableName = 'internal_user_tracking'
module.exports = (sequelize, DataTypes) => {
	const internal_user_tracking = sequelize.define(tableName,
		{
			id: {
				type: DataTypes.INTEGER,
				autoIncrement: true,
				primaryKey: true,
			},
			username: {
				type: DataTypes.TEXT,
				unique: true
			}
		}, 
		{
			freezeTableName: true,
			tableName,
			timestamps: false
		}
	);
	return internal_user_tracking;
};
