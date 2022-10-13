'use strict';
module.exports = {
	up: (queryInterface, Sequelize) => {
		return queryInterface.createTable('reviewer', {
			id: {
				type: Sequelize.INTEGER,
				autoIncrement: true,
				primaryKey: true,
			},
			name: {
				type: Sequelize.TEXT,
			},
			type: {
				type: Sequelize.TEXT,
			},
			title: {
				type: Sequelize.TEXT,
			},
			organization: {
				type: Sequelize.TEXT,
			},
			email: {
				type: Sequelize.TEXT,
			},
			phone_number: {
				type: Sequelize.TEXT,
			},
		});
	},
	down: (queryInterface, _Sequelize) => {
		return queryInterface.dropTable('reviewer');
	},
};
