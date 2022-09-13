'use strict';
const tablename = 'portfolio';

module.exports = {
	up: (queryInterface, Sequelize) => {
		return queryInterface.describeTable(tablename).then((tableDefinition) => {
			return queryInterface.sequelize.transaction(function () {
				Promise.all([queryInterface.renameColumn(tablename, 'private', 'isPrivate')]);
			});
		});
	},

	down: (queryInterface, Sequelize) => {
		return queryInterface.sequelize.transaction(function () {
			Promise.all([queryInterface.renameColumn(tablename, 'isPrivate', 'private')]);
		});
	},
};
