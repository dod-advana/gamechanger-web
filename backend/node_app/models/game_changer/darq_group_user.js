'use strict';
const tableName = 'darq_group_user';
module.exports = (sequelize, Sequelize) => {
	return sequelize.define(tableName, {
		id: {
			allowNull: false,
			autoIncrement: true,
			primaryKey: true,
			type: Sequelize.INTEGER,
		},
		group_id: {
			type: Sequelize.INTEGER
		},
		user_id: {
			type: Sequelize.INTEGER
		}
	}, {
		underscored: true,
		tableName,
		timestamps: false,
	});
};
