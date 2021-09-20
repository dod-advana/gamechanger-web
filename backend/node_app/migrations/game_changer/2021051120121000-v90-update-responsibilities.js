'use strict';
const tablename = 'responsibilities';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(function () {
			return Promise.all([
				queryInterface.removeColumn(tablename, 'primaryEntity'),
        queryInterface.removeColumn(tablename, 'entitiesFound'),
        queryInterface.removeColumn(tablename, 'responsibilityLevel1'),
        queryInterface.removeColumn(tablename, 'responsibilityLevel2'),
        queryInterface.removeColumn(tablename, 'responsibilityLevel3'),
        queryInterface.removeColumn(tablename, 'references'),
        queryInterface.addColumn(tablename, 'documentTitle', Sequelize.TEXT),
        queryInterface.addColumn(tablename, 'organizationPersonnel', Sequelize.TEXT),
        queryInterface.addColumn(tablename, 'responsibilityText', Sequelize.TEXT),
        queryInterface.addColumn(tablename, 'otherOrganizationPersonnel', Sequelize.TEXT),
        queryInterface.addColumn(tablename, 'documentsReferenced', Sequelize.ARRAY(Sequelize.TEXT))
			]);
		});
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(function () {
			return Promise.all([
        queryInterface.removeColumn(tablename, 'documentTitle'),
        queryInterface.removeColumn(tablename, 'organizationPersonnel'),
        queryInterface.removeColumn(tablename, 'otherOrganizationPersonnel'),
        queryInterface.removeColumn(tablename, 'responsibilityText'),
        queryInterface.removeColumn(tablename, 'documentsReferenced'),
        queryInterface.addColumn(tablename, 'primaryEntity', Sequelize.TEXT),
        queryInterface.addColumn(tablename, 'responsibilityLevel1', Sequelize.TEXT),
        queryInterface.addColumn(tablename, 'responsibilityLevel2', Sequelize.TEXT),
        queryInterface.addColumn(tablename, 'responsibilityLevel3', Sequelize.TEXT),
        queryInterface.addColumn(tablename, 'entitiesFound', Sequelize.TEXT),
        queryInterface.addColumn(tablename, 'references', Sequelize.TEXT)
			]);
		});
  }
};
