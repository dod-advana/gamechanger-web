'use strict';

module.exports = {
    up: (queryInterface, Sequelize) => {
		return queryInterface.sequelize.transaction(function () {
			return Promise.all([
				queryInterface.addColumn('gc_assists', 'tag_unknown', Sequelize.BOOLEAN),
			]);
		});
	},

	down: (queryInterface, Sequelize) => {
		return queryInterface.sequelize.transaction(function () {
			return Promise.all([
				queryInterface.removeColumn('gc_assists', 'tag_unknown', Sequelize.BOOLEAN),
			]);
		});
	}
};
