'use strict';
const tablename = 'admins'
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
				type: Sequelize.STRING
			}
		});
	},
	down: (queryInterface, Sequelize) => {
		return queryInterface.dropTable(tablename);
	}
};
