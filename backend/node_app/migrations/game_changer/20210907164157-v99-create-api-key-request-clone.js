'use strict';
module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.createTable('api_key_request_clones', {
			id: {
				allowNull: false,
				type: Sequelize.INTEGER,
				autoIncrement: true,
				primaryKey: true
			},
			apiKeyRequestId: {
				allowNull: false,
				type: Sequelize.INTEGER,
                references: {
                    model: 'api_key_requests',
                    key: 'id'
                  },
                  onUpdate: 'cascade',
                  onDelete: 'cascade'
			},
			cloneId: {
				allowNull: false,
				type: Sequelize.INTEGER,
                references: {
                    model: 'clone_meta',
                    key: 'id'
                  },
                  onUpdate: 'cascade',
                  onDelete: 'cascade'
			},
			createdAt: Sequelize.DATE,
			updatedAt: Sequelize.DATE
		});
	},
	down: async (queryInterface, Sequelize) => {
		await queryInterface.dropTable('api_key_request_clones');
	}
};
