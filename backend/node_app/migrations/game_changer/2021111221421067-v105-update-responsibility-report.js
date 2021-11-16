'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		return queryInterface.sequelize.transaction(function () {
			return Promise.all([
				queryInterface.addColumn('responsibility_reports', 'updatedColumn', Sequelize.STRING),
				queryInterface.addColumn('responsibility_reports', 'updatedText', Sequelize.STRING),
			]);
		});
	},

	down: async (queryInterface, Sequelize) => {
		return queryInterface.sequelize.transaction(function () {
			return Promise.all([
				queryInterface.removeColumn('responsibility_reports', 'updatedColumn', Sequelize.STRING),
				queryInterface.removeColumn('responsibility_reports', 'updatedText', Sequelize.STRING)
			]);
		});
	}
};

