'use strict';
module.exports = {
	up: (queryInterface, Sequelize) => {
		return queryInterface.createTable('feedback', {
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.INTEGER,
			},
			first_name: {
				type: Sequelize.TEXT,
			},
			last_name: {
				type: Sequelize.TEXT,
			},
			email: {
				type: Sequelize.TEXT,
			},
			type: {
				type: Sequelize.TEXT,
			},
			description: {
				type: Sequelize.TEXT,
			},
		});
	},
	down: (queryInterface, Sequelize) => {
		return queryInterface.dropTable('feedback');
	},
};
