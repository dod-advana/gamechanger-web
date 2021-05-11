'use strict';
module.exports = (sequelize, DataTypes) => {
	const roleperm = sequelize.define('roleperm',
		{
			roleid: {
				type: DataTypes.INTEGER,
				primaryKey: true
			},
			permissionid: {
				type: DataTypes.INTEGER,
				primaryKey: true
			},
			createdAt: {
				type: DataTypes.DATE,
			},
			updatedAt: {
				type: DataTypes.DATE,
			}
		}
	);
	return roleperm;
};
