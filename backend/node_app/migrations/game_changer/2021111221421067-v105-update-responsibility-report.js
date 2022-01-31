'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		return queryInterface.sequelize.transaction(function () {
			return Promise.all([
				queryInterface.addColumn('responsibility_reports', 'updatedColumn', Sequelize.TEXT),
				queryInterface.addColumn('responsibility_reports', 'updatedText', Sequelize.TEXT),
				queryInterface.addColumn('responsibility_reports', 'textPosition', Sequelize.JSON),
			]);
		});
	},

	down: async (queryInterface, Sequelize) => {
		return queryInterface.sequelize.transaction(function () {
			return Promise.all([
				queryInterface.removeColumn('responsibility_reports', 'updatedColumn', Sequelize.TEXT),
				queryInterface.removeColumn('responsibility_reports', 'updatedText', Sequelize.TEXT),
				queryInterface.removeColumn('responsibility_reports', 'textPosition', Sequelize.JSON)
			]);
		});
	}
};

