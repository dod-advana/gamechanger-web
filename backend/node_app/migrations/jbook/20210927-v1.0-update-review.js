'use strict';

module.exports = {
	up: async (queryInterface, _Sequelize) => {
		return queryInterface.sequelize.transaction(function () {});
	},

	down: async (queryInterface, _Sequelize) => {
		return queryInterface.sequelize.transaction(function () {});
	},
};
