'use strict';
module.exports = (sequelize, DataTypes) => {
	const export_history = sequelize.define('export_history',
		{
			id: {
				type: DataTypes.INTEGER,
				autoIncrement: true,
				primaryKey: true,
			},
			user_id: {
				type: DataTypes.STRING,
				allowNull: false
			},
			new_user_id: {
				type: DataTypes.STRING,
			},
			download_request_body: {
				type: DataTypes.JSONB
			},
			search_response_metadata: {
				type: DataTypes.JSONB
			}
		},
		{
			freezeTableName: true,
			tableName: 'export_history',
			timestamps: true
		}
	);
	return export_history;
};
