'use strict';
const tablename = 'rdoc_accomp';
module.exports = {
	up: (queryInterface, _Sequelize) => {
		return queryInterface.describeTable(tablename).then((tableDefinition) => {
			const queries = [];

			if (tableDefinition['Project_Number'])
				queries.push(queryInterface.renameColumn(tablename, 'Project_Number', 'Proj_Number'));

			return queryInterface.sequelize.transaction(function () {
				Promise.all(queries);
			});
		});
	},

	down: (queryInterface, _Sequelize) => {
		return queryInterface.sequelize.transaction(function () {
			Promise.all([queryInterface.renameColumn(tablename, 'Proj_Number', 'Project_Number')]);
		});
	},
};
