'use strict';
const tablename = 'admins';

module.exports = {
	up: (queryInterface, Sequelize) => {
		return queryInterface.sequelize.transaction(function () {
			return Promise.all([
				queryInterface.changeColumn(tablename, 'username', {
					type: Sequelize.STRING,
					unique: true
				}),
			]);
		});
	},

	down: (queryInterface, Sequelize) => {
		return queryInterface.sequelize.transaction(function () {
			return Promise.all([
				queryInterface.changeColumn(tablename, 'username', {
					type: Sequelize.STRING,
					unique: false
				}),
			]);
		});
	}
};
