'use strict';
const tablename = 'clone_meta';

module.exports = {
	up: (queryInterface, Sequelize) => {
		return queryInterface.sequelize.transaction(function () {
			return Promise.all([
				queryInterface.changeColumn(tablename, 'clone_name', {
					type: Sequelize.STRING,
					unique: true
				}),
			]);
		});
	},

	down: (queryInterface, Sequelize) => {
		return queryInterface.sequelize.transaction(function () {
			return Promise.all([
				queryInterface.changeColumn(tablename, 'clone_name', {
					type: Sequelize.STRING,
					unique: false
				}),
			]);
		});
	}
};
