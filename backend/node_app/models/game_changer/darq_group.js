'use strict';
const tableName = 'darq_group';
module.exports = (sequelize, Sequelize) => {
	const DARQGroup = sequelize.define(tableName, {
		id: {
			allowNull: false,
			autoIncrement: true,
			primaryKey: true,
			type: Sequelize.INTEGER,
		},
		name: {
			type: Sequelize.TEXT
		},
		agency: {
			type: Sequelize.STRING
		},
		level: {
			type: Sequelize.STRING
		},
		parent_id: {
			type: Sequelize.INTEGER
		},
		child_id: {
			type: Sequelize.INTEGER
		},
		next_id: {
			type: Sequelize.INTEGER
		}
	}, {
		underscored: true,
		tableName,
		timestamps: false,
		classMethods: {
			associate: (models) => {
				DARQGroup.hasMany(models.darq_group_user, { foreignKey: 'group_id' });
				DARQGroup.belongsToMany(models.user, { through: models.darq_group_user, foreignKey: 'group_id' });
			},
		}
	});

	return DARQGroup;
};
