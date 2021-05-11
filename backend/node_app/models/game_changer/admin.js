'use strict';

module.exports = (sequelize, DataTypes) => {
	const Admin = sequelize.define('admin',
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
		},{
			timestamps: false
		}
	);
	return Admin;
};
