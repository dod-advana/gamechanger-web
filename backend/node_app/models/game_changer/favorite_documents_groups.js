'use strict'
module.exports = (sequelize, DataTypes) => {
    const FAVORITE_DOCUMENTS_GROUP = sequelize.define("favorite_documents_groups", 
    {
        favorite_group_id: {
            type: DataTypes.TEXT,
            allowNull: false,
            primaryKey: true
        },
        favorite_document_id: {
            type: DataTypes.TEXT,
            allowNull: false,
            primaryKey: true
        },
    }, 
    {
        freezeTableName: true,
        tableName: 'favorite_documents_groups',
        timestamps: true
    }
    );
  
    return FAVORITE_DOCUMENTS_GROUP;
  };