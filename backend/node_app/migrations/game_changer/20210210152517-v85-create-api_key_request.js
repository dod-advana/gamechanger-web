'use strict';
const tablename = 'api_key_requests';
module.exports = {
	up: (queryInterface, Sequelize) => {
		return queryInterface.createTable(tablename, {
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.INTEGER
			},
			username: {
				type: Sequelize.TEXT
			},
			name: {
				type: Sequelize.TEXT,
			},
			email: {
				type: Sequelize.TEXT,
			},
			reason: {
				type: Sequelize.TEXT,
			},
			approved: {
				type: Sequelize.BOOLEAN,
				defaultValue: false
			},
			rejected: {
				type: Sequelize.BOOLEAN,
				defaultValue: false
			},
			createdAt: {
				allowNull: false,
				type: Sequelize.DATE
			},
			updatedAt: {
				allowNull: false,
				type: Sequelize.DATE,
				defaultValue: Sequelize.fn('NOW')
			}
		});
	},
	down: (queryInterface, Sequelize) => {
		return queryInterface.dropTable(tablename);
	}
};
