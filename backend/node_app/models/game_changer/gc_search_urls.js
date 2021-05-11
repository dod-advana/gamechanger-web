'use strict';
module.exports = (sequelize, DataTypes) => {
  const gc_search_urls = sequelize.define('gc_search_urls', {
    url: DataTypes.TEXT,
  }, {
    freezeTableName: true,
    tableName: 'gc_search_urls',
    timestamps: false
  });
  return gc_search_urls;
};