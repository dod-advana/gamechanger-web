'use strict';
module.exports = {
	up: (queryInterface, Sequelize) => {
		return queryInterface.createTable('users', {
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.INTEGER,
			},
			first_name: {
				type: Sequelize.TEXT,
			},
			middle_initial: {
				type: Sequelize.TEXT,
			},
			last_name: {
				type: Sequelize.TEXT,
			},
			is_primary_reviewer: {
				type: Sequelize.BOOLEAN,
			},
			is_service_reviewer: {
				type: Sequelize.BOOLEAN,
			},
			is_poc_reviewer: {
				type: Sequelize.BOOLEAN,
			},
			is_admin: {
				type: Sequelize.BOOLEAN,
			},
		});
	},
	down: (queryInterface, Sequelize) => {
		return queryInterface.dropTable('users');
	},
};
