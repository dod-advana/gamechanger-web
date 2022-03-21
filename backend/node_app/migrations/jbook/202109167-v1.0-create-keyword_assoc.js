'use strict';
module.exports = {
	up: (queryInterface, Sequelize) => {
		return queryInterface.createTable('keyword_assoc', {
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.INTEGER
			},
			keyword_id: {
				type: Sequelize.INTEGER,
				primaryKey: true
			},
			pdoc_id: {
				type: Sequelize.INTEGER
			},
			rdoc_id: {
				type: Sequelize.INTEGER
			},
			om_id: {
				type: Sequelize.INTEGER
			}
		});
	},
	down: (queryInterface, Sequelize) => {
		return queryInterface.dropTable('keyword_assoc');
	}
};