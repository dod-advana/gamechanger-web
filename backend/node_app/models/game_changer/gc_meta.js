'use strict';
module.exports = (sequelize, DataTypes) => {
	const CLONE_META = sequelize.define('clone_meta',
		{
			id: {
				type: DataTypes.INTEGER,
				autoIncrement: true,
				primaryKey: true,
			},
			clone_name: {
				type: DataTypes.TEXT
			},
			display_name: {
				type: DataTypes.TEXT
			},
			is_live: {
				type: DataTypes.BOOLEAN
			},
			url: {
				type: DataTypes.TEXT
			},
			permissions_required: {
				type: DataTypes.BOOLEAN
			},
			clone_to_sipr: {
				type: DataTypes.BOOLEAN
			},
			show_tutorial: {
				type: DataTypes.BOOLEAN
			},
			show_graph: {
				type: DataTypes.BOOLEAN
			},
			show_crowd_source: {
				type: DataTypes.BOOLEAN
			},
			show_feedback: {
				type: DataTypes.BOOLEAN
			},
			search_module: {
				type: DataTypes.STRING
			},
			export_module: {
				type: DataTypes.STRING
			},
			title_bar_module: {
				type: DataTypes.STRING
			},
			navigation_module: {
				type: DataTypes.STRING
			},
			card_module: {
				type: DataTypes.STRING
			},
			main_view_module: {
				type: DataTypes.STRING
			},
			graph_module: {
				type: DataTypes.STRING
			},
			search_bar_module: {
				type: DataTypes.STRING
			},
			s3_bucket: {
				type: DataTypes.STRING
			},
			metadata_creation_group: {
				type: DataTypes.STRING
			},
			source_s3_bucket: {
				type: DataTypes.STRING
			},
			source_s3_prefix: {
				type: DataTypes.STRING
			},
			elasticsearch_index: {
				type: DataTypes.STRING
			},
			needs_ingest: {
				type: DataTypes.BOOLEAN
			},
			available_at: {
				type: DataTypes.ARRAY(DataTypes.STRING)
			},
			document_view: {
				type: DataTypes.BOOLEAN
			},
			user_favorites: {
				type: DataTypes.BOOLEAN
			},
			createdAt: {
				type: DataTypes.DATE
			},
			updatedAt: {
				type: DataTypes.DATE
			}
		},
		{
			freezeTableName: true,
			tableName: 'clone_meta',
			timestamps: false
		}
	);

	CLONE_META.associate = (models) => {
		CLONE_META.belongsToMany(models.api_key_request, { 
			through: 'api_key_request_clone', 
			foreignKey: 'cloneId'
		})
		CLONE_META.belongsToMany(models.api_key, { 
			through: 'api_key_clone', 
			foreignKey: 'cloneId'
		})
	}
	
	return CLONE_META;
};