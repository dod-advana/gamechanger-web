'use strict';
module.exports = (sequelize, DataTypes) => {
	const userrole = sequelize.define('userrole',
		{
			userid: {
				type: DataTypes.INTEGER,
				primaryKey: true
			},
			roleid: {
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
	return userrole;
};
