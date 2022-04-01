'use strict';
const tablename = 'doc_ingest_requests';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.createTable(tablename, {
			id: {
				allowNull: false,
				type: Sequelize.INTEGER,
				autoIncrement: true,
				primaryKey: true,
			},
			user_id: {
				allowNull: false,
				type: Sequelize.TEXT,
			},
			doc_id: {
				allowNull: false,
				type: Sequelize.TEXT,
			},
			createdAt: Sequelize.DATE,
			updatedAt: Sequelize.DATE,
		});
	},
	down: async (queryInterface, Sequelize) => {
		await queryInterface.dropTable(tablename);
	},
};
