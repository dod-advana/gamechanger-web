'use strict';
module.exports = (sequelize, DataTypes) => {
	const matomo_status = sequelize.define('matomo_status', {
		userID: DataTypes.STRING,
		tracking: DataTypes.BOOLEAN
	}, {
		freezeTableName: true,
		tableName: 'matomo_status',
		timestamps: false
	});
	return matomo_status;
};