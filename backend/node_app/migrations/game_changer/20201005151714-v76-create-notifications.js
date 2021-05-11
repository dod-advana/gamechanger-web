'use strict';

const tablename = 'notifications'
module.exports = {
	up: (queryInterface, Sequelize) => {
		return queryInterface.createTable(tablename, {
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.INTEGER
			},
			project_name: {
				type: Sequelize.TEXT
			},
			level: {
				type: Sequelize.TEXT
			},
			message: {
				type: Sequelize.TEXT
			},
			active: {
				type: Sequelize.BOOLEAN
			}
		});
	},
	down: (queryInterface, Sequelize) => {
		return queryInterface.dropTable(tablename);
	}
};
