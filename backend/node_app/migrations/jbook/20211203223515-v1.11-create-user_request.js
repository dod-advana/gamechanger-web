'use strict';
module.exports = {
	up: (queryInterface, Sequelize) => {
		return queryInterface.createTable('user_requests', {
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.INTEGER,
			},
			email: {
				type: Sequelize.TEXT,
			},
			organization: {
				type: Sequelize.TEXT,
			},
			phone_number: {
				type: Sequelize.TEXT,
			},
			is_activated: {
				type: Sequelize.BOOLEAN,
			},
		});
	},
	down: (queryInterface, _Sequelize) => {
		return queryInterface.dropTable('user_requests');
	},
};
