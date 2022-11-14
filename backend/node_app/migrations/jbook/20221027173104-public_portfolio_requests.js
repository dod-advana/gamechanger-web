'use strict';
module.exports = {
	up: (queryInterface, Sequelize) => {
		return queryInterface.createTable('public_portfolio_requests', {
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.INTEGER,
			},
			creator: {
				type: Sequelize.INTEGER,
			},
			portfolio_name: {
				type: Sequelize.TEXT,
			},
			justification: {
				type: Sequelize.TEXT,
			},
			request_date: {
				type: Sequelize.DATE,
				defaultValue: Sequelize.fn('NOW'),
				allowNull: false,
			},
		});
	},
	down: (queryInterface, _Sequelize) => {
		return queryInterface.dropTable('public_portfolio_requests');
	},
};
