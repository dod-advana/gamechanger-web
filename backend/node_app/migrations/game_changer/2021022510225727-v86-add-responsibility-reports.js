'use strict';
const tablename = 'responsibility_reports';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		return queryInterface.createTable(tablename, {
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.INTEGER
			},
			responsibility_id: {
				type: Sequelize.INTEGER,
				allowNull: false
			},
			reporter_hashed_username: {
				type: Sequelize.TEXT,
				allowNull: false
			},
			issue_description: {
				type: Sequelize.TEXT,
				allowNull: false
			},
			createdAt: {
				allowNull: false,
				type: Sequelize.DATE
			},
			updatedAt: {
				allowNull: false,
				type: Sequelize.DATE,
				defaultValue: Sequelize.fn('NOW')
			}
		});
	},

	down: async (queryInterface, Sequelize) => {
		return queryInterface.dropTable(tablename);
	}
};
