'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		return queryInterface.createTable('favorite_documents_groups',
		{
			id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                allowNull: false
            },
            favorite_group_id: {
                type: Sequelize.TEXT,
                allowNull: false
            },
            favorite_document_id: {
                type: Sequelize.TEXT
            },
			createdAt: Sequelize.DATE,
			updatedAt: Sequelize.DATE,
		});
	},

	down: async (queryInterface, Sequelize) => {
		return queryInterface.dropTable('favorite_documents_groups');
	}
};
