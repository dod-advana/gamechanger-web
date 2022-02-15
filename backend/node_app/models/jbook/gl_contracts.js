'use strict';
module.exports = (sequelize, DataTypes) => {
	const GL_CONTRACTS = sequelize.define('gl_contracts',
		{
			id: {
				type: DataTypes.INTEGER,
				autoIncrement: true,
				primaryKey: true,
				allowNull: false
			},
			bli: {
				type: DataTypes.TEXT,
			},
			projnumber: {
				type: DataTypes.TEXT,
			},
			global_parent_duns_name: {
				type: DataTypes.TEXT,
			},
			vendor_name: {
				type: DataTypes.TEXT,
			},
			parent_award: {
				type: DataTypes.TEXT,
			},
			piin: {
				type: DataTypes.TEXT,
			},
			fiscal_year: {
				type: DataTypes.TEXT,
			},
			product_desc: {
				type: DataTypes.TEXT,
			},
			award_desc: {
				type: DataTypes.TEXT,
			},
			budget_type: {
				type: DataTypes.TEXT,
			},
			table_source: {
				type: DataTypes.TEXT,
			},
			total_oblig_amount: {
				type: DataTypes.TEXT,
			},
			modification_number: {
				type: DataTypes.TEXT,
			}
		}, {
		freezeTableName: true,
		timestamps: false,
		tableName: 'gl_contracts'
	}
	);
	return GL_CONTRACTS;
};
