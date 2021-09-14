'use strict';
const tablename = 'organization_info';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		return queryInterface.createTable(tablename, {
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.INTEGER
			},
			org_name: {
				type: Sequelize.STRING,
				allowNull: false
			},
			org_acronym: {
				type: Sequelize.STRING,
				allowNull: false
			},
			image_link: {
				type: Sequelize.STRING,
				allowNull: false
			}
		});
	},

	down: async (queryInterface, Sequelize) => {
		return queryInterface.dropTable(tablename);
	}
};
