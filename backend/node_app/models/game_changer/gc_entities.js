'use strict';
module.exports = (sequelize, DataTypes) => {
  const gc_entities = sequelize.define('gc_entities', {
    name: DataTypes.STRING,
    type: DataTypes.STRING,
    description: DataTypes.STRING(1000),
    alias: DataTypes.STRING,
    img_url: DataTypes.STRING,
    resource_url: DataTypes.STRING,
    synonyms: DataTypes.STRING,
    category: DataTypes.STRING,
    key_people: DataTypes.STRING
  }, {
    freezeTableName: true,
    tableName: 'gc_entities',
    timestamps: false
  });
  gc_entities.associate = function(models) {
    // associations can be defined here
  };
  return gc_entities;
};