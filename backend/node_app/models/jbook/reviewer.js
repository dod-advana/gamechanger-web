'use strict';
module.exports = (sequelize, DataTypes) => {
	return sequelize.define('reviewer',
		{
			id: {
				type: DataTypes.INTEGER,
				autoIncrement: true,
				primaryKey: true,
			},
			name: {
				type: DataTypes.TEXT,
				unique: true,
			},
			type: {
				type: DataTypes.TEXT
			},
			title: {
				type: DataTypes.TEXT
			},
			organization: {
				type: DataTypes.TEXT
			},
			email: {
				type: DataTypes.TEXT
			},
			phone_number: {
				type: DataTypes.BOOLEAN,
				defaultValue: false
			},
		}, {
			freezeTableName: true,
			timestamps: false,
			tableName: 'reviewer'
		}
	);
};
