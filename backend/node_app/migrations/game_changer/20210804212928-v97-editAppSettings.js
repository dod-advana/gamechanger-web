'use strict';
const tablename = 'app_settings'
module.exports = {
	up: (queryInterface, Sequelize) => {
		return queryInterface.sequelize.transaction(function () {
			return Promise.all([
				queryInterface.changeColumn(tablename, 'value', {
					type: Sequelize.TEXT,
          allowNull: false
				}),
			]);
		});
	},

	down: (queryInterface, Sequelize) => {
		return queryInterface.sequelize.transaction(function () {
			return Promise.all([
				queryInterface.changeColumn(tablename, 'value', {
					type: Sequelize.STRING,
          allowNull: false
				}),
			]);
		});
	}
};
