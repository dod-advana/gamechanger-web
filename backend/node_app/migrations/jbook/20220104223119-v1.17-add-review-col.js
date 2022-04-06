'use strict';
const tablename = 'review';

module.exports = {
	up: (queryInterface, Sequelize) => {
		return queryInterface.describeTable(tablename).then((tableDefinition) => {
			const queries = [];

			if (!tableDefinition['intelligent_systems_agree'])
				queries.push(queryInterface.addColumn(tablename, 'intelligent_systems_agree', Sequelize.TEXT));
			if (!tableDefinition['poc_joint_capability_area2'])
				queries.push(queryInterface.addColumn(tablename, 'poc_joint_capability_area2', Sequelize.TEXT));
			if (!tableDefinition['poc_joint_capability_area3'])
				queries.push(queryInterface.addColumn(tablename, 'poc_joint_capability_area3', Sequelize.TEXT));

			return queryInterface.sequelize.transaction(function () {
				Promise.all(queries);
			});
		});
	},

	down: (queryInterface, Sequelize) => {
		return queryInterface.sequelize.transaction(function () {
			Promise.all([
				queryInterface.removeColumn(tablename, 'intelligent_systems_agree', Sequelize.TEXT),
				queryInterface.removeColumn(tablename, 'poc_joint_capability_area2', Sequelize.TEXT),
				queryInterface.removeColumn(tablename, 'poc_joint_capability_area3', Sequelize.TEXT),
			]);
		});
	},
};
