'use strict';
module.exports = (sequelize, DataTypes) => {
	const GC_ASSISTS = sequelize.define('gc_assists', {
		id: {
			type: DataTypes.INTEGER,
			autoIncrement: true,
			primaryKey: true,
		},
		user_id: {
			type: DataTypes.TEXT,
			field: 'user_id'
		},
		user_score: {
			type: DataTypes.FLOAT,
			field: 'user_score'
		},
		is_sme: {
			type: DataTypes.BOOLEAN,
			field: 'is_sme'
		},
		document_id: {
			type: DataTypes.TEXT,
			field: 'document_id'
		},
		paragraph_id: {
			type: DataTypes.INTEGER,
			field: 'paragraph_id'
		},
		tokens_assumed: {
			type: DataTypes.TEXT,
			field: 'tokens_assumed'
		},
		entity_tag: {
			type: DataTypes.TEXT,
			field: 'entity_tag'
		},
		confidence_score: {
			type: DataTypes.FLOAT,
			field: 'confidence_score'
		},
		tagged_correctly: {
			type: DataTypes.BOOLEAN,
			field: 'tagged_correctly'
		},
		incorrect_reason: {
			type: DataTypes.INTEGER,
			field: 'incorrect_reason'
		},
		tag_unknown: {
			type: DataTypes.BOOLEAN,
			field: 'tag_unknown'
		},
	}, {
		freezeTableName: true,
		tableName: 'gc_assists',
		timestamps: true
	});
	return GC_ASSISTS;
};