'use strict';
module.exports = (sequelize, DataTypes) => {
  const gc_search_votes = sequelize.define('gc_search_votes', {
    username: DataTypes.STRING,
    query_text: DataTypes.STRING,
    doc_title: DataTypes.STRING,
    vote: DataTypes.BOOLEAN
  }, {
    
			freezeTableName: true,
			tableName: 'gc_search_votes',
			timestamps: false,
      classMethods: {
        associate: (models) => {
          gc_search_votes.belongsTo(models.user, { foreignKey: 'username' });
        },
      }
  });
  return gc_search_votes;
};