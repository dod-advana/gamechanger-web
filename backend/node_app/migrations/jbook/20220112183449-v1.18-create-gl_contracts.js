'use strict';
module.exports = {
	up: (queryInterface, Sequelize) => {
		return queryInterface.createTable('gl_contracts', {
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.INTEGER
			},
			bli: {
				type: Sequelize.TEXT
			},
      projnumber: {
				type: Sequelize.TEXT
			},
      global_parent_duns_name: {
				type: Sequelize.TEXT
			},
      vendor_name: {
				type: Sequelize.TEXT
			},
      parent_award: {
				type: Sequelize.TEXT
			},
      piin: {
				type: Sequelize.TEXT
			},
      fiscal_year: {
				type: Sequelize.TEXT
			},
      product_desc: {
				type: Sequelize.TEXT
			},
      award_desc: {
				type: Sequelize.TEXT
			},
      budget_type: {
				type: Sequelize.TEXT
			},
      table_source: {
				type: Sequelize.TEXT
			},
		});
	},
	down: (queryInterface, Sequelize) => {
		return queryInterface.dropTable('gl_contracts');
	}
};