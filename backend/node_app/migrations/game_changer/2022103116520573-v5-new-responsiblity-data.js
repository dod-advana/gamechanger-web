'use strict';
const tablename = 'responsibilities';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		return queryInterface.describeTable(tablename).then((tableDefinition) => {
			const queries = [];
			if (tableDefinition['organizationPersonnel'])
				queries.push(queryInterface.removeColumn(tablename, 'organizationPersonnel'));
			if (tableDefinition['otherOrganizationPersonnel'])
				queries.push(queryInterface.removeColumn(tablename, 'otherOrganizationPersonnel'));
			if (tableDefinition['documentsReferenced'])
				queries.push(queryInterface.removeColumn(tablename, 'documentsReferenced'));

			if (!tableDefinition['organizationPersonnelNumbering'])
				queries.push(queryInterface.addColumn(tablename, 'organizationPersonnelNumbering', Sequelize.TEXT));
			if (!tableDefinition['organizationPersonnelText'])
				queries.push(queryInterface.addColumn(tablename, 'organizationPersonnelText', Sequelize.TEXT));
			if (!tableDefinition['organizationPersonnelEntities'])
				queries.push(queryInterface.addColumn(tablename, 'organizationPersonnelEntities', Sequelize.TEXT));
			if (!tableDefinition['responsibilityNumbering'])
				queries.push(queryInterface.addColumn(tablename, 'responsibilityNumbering', Sequelize.TEXT));
			if (!tableDefinition['responsibilityEntities'])
				queries.push(queryInterface.addColumn(tablename, 'responsibilityEntities', Sequelize.TEXT));

			return queryInterface.sequelize.transaction(function () {
				Promise.all(queries);
			});
		});
	},

	down: async (queryInterface, Sequelize) => {
		return queryInterface.sequelize.transaction(function () {
			Promise.all([
				queryInterface.addColumn(tablename, 'organizationPersonnel', Sequelize.TEXT),
				queryInterface.addColumn(tablename, 'otherOrganizationPersonnel', Sequelize.TEXT),
				queryInterface.addColumn(tablename, 'documentsReferenced', Sequelize.ARRAY(Sequelize.TEXT)),

				queryInterface.removeColumn(tablename, 'organizationPersonnelNumbering'),
				queryInterface.removeColumn(tablename, 'organizationPersonnelText'),
				queryInterface.removeColumn(tablename, 'organizationPersonnelEntities'),
				queryInterface.removeColumn(tablename, 'responsibilityNumbering'),
				queryInterface.removeColumn(tablename, 'responsibilityEntities'),
			]);
		});
	},
};
