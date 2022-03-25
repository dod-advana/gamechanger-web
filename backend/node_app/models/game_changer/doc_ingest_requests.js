'use strict';
module.exports = (sequelize, DataTypes) => {
	const DOC_INGEST_REQUEST = sequelize.define('doc_ingest_requests',
		{
			id: {
				type: DataTypes.INTEGER,
				autoIncrement: true,
				primaryKey: true,
			},
			doc_id: {
				type: DataTypes.STRING,
				allowNull: false
			},
			user_id: {
				type: DataTypes.STRING,
				allowNull: false
			}
		},
		{
			freezeTableName: true,
			tableName: 'doc_ingest_requests',
			updatedAt: false,
		}
	);
	return DOC_INGEST_REQUEST;
};
