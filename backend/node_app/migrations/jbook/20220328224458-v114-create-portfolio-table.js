'use strict';

module.exports = {
	up: (queryInterface, Sequelize) => {
		return queryInterface.createTable('portfolio', {
			id: {
				type: Sequelize.INTEGER,
				autoIncrement: true,
				primaryKey: true,
			},
			name : {
				type: Sequelize.TEXT,
			},
			description : {
				type: Sequelize.TEXT,
			},
			user_ids : {
				type: Sequelize.ARRAY(Sequelize.INTEGER),
			},
			tags: {
				type: Sequelize.ARRAY(Sequelize.TEXT),
			},
		});
	},
	down: (queryInterface, Sequelize) => {
		return queryInterface.dropTable('portfolio');
	}
};
