'use strict'
module.exports = (sequelize, DataTypes) => {
    const FAVORITE_DOCUMENTS_GROUP = sequelize.define("favorite_documents_groups", 
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        favorite_group_id: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        favorite_document_id: {
            type: DataTypes.TEXT
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