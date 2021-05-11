'use strict';

module.exports = (sequelize, Sequelize) => {
	const eventHistory = sequelize.define('eventHistory',
		{
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.INTEGER,
			},
			userCn: {
				type: Sequelize.STRING,
				field: 'user_cn',
			},
			table: {
				type: Sequelize.TEXT,
			},
			objectId: {
				type: Sequelize.INTEGER,
				field: 'object_id',
			},
			action: {
				type: Sequelize.TEXT,
			},
			field: {
				type: Sequelize.TEXT,
			},
			oldValue: {
				type: Sequelize.TEXT,
				field: 'old_value',
			},
			newValue: {
				type: Sequelize.TEXT,
				field: 'new_value',
			},
			createdAt: {
				type: Sequelize.DATE,
				field: 'created_at',
			},
			updatedAt: {
				type: Sequelize.DATE,
				field: 'updated_at',
			},
		}, {
			underscored: true,
			tableName: 'event_histories',
		});
	return eventHistory;
};
