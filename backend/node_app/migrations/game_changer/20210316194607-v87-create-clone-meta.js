'use strict';
const tablename = 'clone_meta';
module.exports = {
	up: (queryInterface, Sequelize) => {
		return queryInterface.createTable(tablename, {
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.INTEGER
			},
			clone_name: {
				type: Sequelize.STRING,
				allowNull: false
			},
			search_module: {
				type: Sequelize.STRING,
				allowNull: false
			},
			export_module: {
				type: Sequelize.STRING,
				allowNull: true
			},
			createdAt: Sequelize.DATE,
			updatedAt: Sequelize.DATE,
		});
	},
	down: (queryInterface, Sequelize) => {
		return queryInterface.dropTable(tablename);
	}
};
