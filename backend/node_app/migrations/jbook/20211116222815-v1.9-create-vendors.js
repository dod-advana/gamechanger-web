'use strict';
module.exports = {
	up: (queryInterface, Sequelize) => {
		return queryInterface.createTable('vendors', {
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.INTEGER,
			},
			global_parent_duns_name: {
				type: Sequelize.TEXT,
			},
			vendor_name: {
				type: Sequelize.TEXT,
			},
			piid: {
				type: Sequelize.TEXT,
			},
			pe_num: {
				type: Sequelize.TEXT,
			},
			fiscal_year: {
				type: Sequelize.TEXT,
			},
		});
	},
	down: (queryInterface, _Sequelize) => {
		return queryInterface.dropTable('vendors');
	},
};
