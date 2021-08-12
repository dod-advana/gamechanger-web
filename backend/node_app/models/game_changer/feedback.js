'use strict';
module.exports = (sequelize, DataTypes) => {
	const FEEDBACK = sequelize.define('feedback',
		{
			id: {
				type: DataTypes.INTEGER,
				autoIncrement: true,
				primaryKey: true,
			},
			event_name: {
				type: DataTypes.STRING,
				allowNull: false
			},
			user_id: {
				type: DataTypes.STRING,
				allowNull: false
			},
			createdAt: {
				allowNull: false,
				type: DataTypes.DATE
			},
			value_1: {
				type: DataTypes.STRING,
			},
			value_2: {
				type: DataTypes.STRING,
			},
			value_3: {
				type: DataTypes.STRING,
			},
			value_4: {
				type: DataTypes.STRING,
			},
			value_5: {
				type: DataTypes.TEXT,
			},
			value_6: {
				type: DataTypes.STRING,
			},
			value_7: {
				type: DataTypes.STRING,
			},
		},
		{
			freezeTableName: true,
			tableName: 'feedback',
			updatedAt: false,
		}
	);
	return FEEDBACK
};
