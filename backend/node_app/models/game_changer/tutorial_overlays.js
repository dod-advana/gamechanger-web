'use strict';
module.exports = (sequelize, DataTypes) => {
	const TUTORIAL_OVERLAYS = sequelize.define('tutorial_overlays',
		{
			id: {
				type: DataTypes.INTEGER,
				autoIncrement: true,
				primaryKey: true,
			},
			app_name: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			current_tutorial_json: {
				type: DataTypes.JSONB,
			},
			new_user_tutorial_json: {
				type: DataTypes.JSONB,
			}
		},{
			freezeTableName: true,
			tableName: 'tutorial_overlays',
			timestamps: false
		}
	);
	return TUTORIAL_OVERLAYS;
};
