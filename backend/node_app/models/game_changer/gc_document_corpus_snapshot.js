'use strict';
module.exports = (sequelize, DataTypes) => {
	const gc_document_corpus_snapshot = sequelize.define('gc_document_corpus_snapshot',
		{
			pub_name: {
				type: DataTypes.STRING,
				allowNull: false
			},
			pub_title: {
				type: DataTypes.STRING,
				allowNull: false
			},
			pub_type: {
				type: DataTypes.STRING,
				allowNull: false
			},
			pub_number: {
				type: DataTypes.STRING,
				allowNull: false
			},
			doc_filename: {
				type: DataTypes.STRING,
				allowNull: false
			},
			doc_s3_location: {
				type: DataTypes.STRING,
				allowNull: false
			},
			upload_date: {
				type: DataTypes.DATE,
				allowNull: false
			},
			publication_date: {
				type: DataTypes.DATE,
				allowNull: false
			},
			doc_id: {
				primaryKey: true,
				type: DataTypes.INTEGER,
				allowNull: false
			},
			pub_id: {
				type: DataTypes.INTEGER,
				allowNull: false
			},
			json_metadata: {
				type: DataTypes.JSONB,
				allowNull: false
			},
			
		},
		{
			freezeTableName: true,
			tableName: 'gc_document_corpus_snapshot',
			timestamps: false
		}
	);
	return gc_document_corpus_snapshot;
};