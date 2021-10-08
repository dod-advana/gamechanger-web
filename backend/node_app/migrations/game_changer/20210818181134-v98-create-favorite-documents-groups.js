'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		return queryInterface.createTable('favorite_documents_groups',
		{
            favorite_group_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                primaryKey: true
            },
            favorite_document_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                primaryKey: true
            },
			createdAt: Sequelize.DATE,
			updatedAt: Sequelize.DATE,
		});
	},

	down: async (queryInterface, Sequelize) => {
		return queryInterface.dropTable('favorite_documents_groups');
	}
};
