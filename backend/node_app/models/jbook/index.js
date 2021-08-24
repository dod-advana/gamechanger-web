'use strict';
const fs = require('fs');
const path = require('path');
const {Sequelize, DataTypes} = require('sequelize');
const basename = path.basename(module.filename);
const constants = require('../../config/constants.js');
const db = {};

let jbook_sequelize = new Sequelize(
	constants.POSTGRES_CONFIG.databases.jbook.database, constants.POSTGRES_CONFIG.databases.jbook.username, constants.POSTGRES_CONFIG.databases.jbook.password, constants.POSTGRES_CONFIG.databases.jbook
);
Sequelize.postgres.DECIMAL.parse = function (value) { return parseFloat(value); };

// Add models from eda folder
fs
	.readdirSync(__dirname)
	.filter(file =>
		(file.indexOf('.') !== 0) &&
        (file !== basename) &&
        (file.slice(-3) === '.js'))
	.forEach(file => {
		const model = require(path.join(__dirname, file))(jbook_sequelize, DataTypes);
		db[model.name] = model;
	});

// db.all_outgoing_counts_pdf_pds_xwalk_only.hasMany(db.line_item_details, {foreignKey: 'pds_filename'});
// db.line_item_details.belongsTo(db.all_outgoing_counts_pdf_pds_xwalk_only, {foreignKey: 'filename'});

db.jbook = jbook_sequelize;

module.exports = db;
