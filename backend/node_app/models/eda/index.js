'use strict';
const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(module.filename);
const constants = require('../../config/constants.js');
const db = {};

let eda_sequelize = new Sequelize(
	constants.POSTGRES_CONFIG.databases.eda.database, constants.POSTGRES_CONFIG.databases.eda.username, constants.POSTGRES_CONFIG.databases.eda.password, constants.POSTGRES_CONFIG.databases.eda
);
Sequelize.postgres.DECIMAL.parse = function (value) { return parseFloat(value); };

db.eda = eda_sequelize;

module.exports = db;
