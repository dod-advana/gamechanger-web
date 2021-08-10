'use strict';
const tablename = 'crawler_info';

module.exports = {
  up: (queryInterface, Sequelize) => {
		return queryInterface.createTable(tablename, {
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.INTEGER
			},
			crawler: {
				type: Sequelize.STRING,
				allowNull: false
			},
			display_org: {
				type: Sequelize.STRING,
				allowNull: false
			},
			display_source_s: {
				type: Sequelize.STRING,
				allowNull: false
			},
      url_origin: {
				type: Sequelize.STRING,
				allowNull: false
			},
      image_link: {
				type: Sequelize.STRING,
				allowNull: false
			},
		});
	},
	down: (queryInterface, Sequelize) => {
		return queryInterface.dropTable(tablename);
	}
};
