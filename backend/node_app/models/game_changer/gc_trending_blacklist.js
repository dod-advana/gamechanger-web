'use strict';
module.exports = (sequelize, DataTypes) => {
	const GC_TRENDING_BLACKLIST = sequelize.define('gc_trending_blacklist', {
		id: {
			type: DataTypes.INTEGER,
			autoIncrement: true,
			primaryKey: true
		},
		search_text: {
			type: DataTypes.TEXT
		},
    	added_by: {
            type: DataTypes.TEXT
        },
        createdAt: {
            type: DataTypes.DATE,
        },
        updatedAt: {
            type: DataTypes.DATE,
        },
	}, {
		freezeTableName: true,
		tableName: 'gc_trending_blacklist',
		timestamps: true
	});
	return GC_TRENDING_BLACKLIST;
};