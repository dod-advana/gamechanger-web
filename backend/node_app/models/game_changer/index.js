'use strict';
const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(module.filename);
const constants = require('../../config/constants.js');
const db = {};

let gc_sequelize = new Sequelize(
	constants.POSTGRES_CONFIG.databases.game_changer.database, constants.POSTGRES_CONFIG.databases.game_changer.username, constants.POSTGRES_CONFIG.databases.game_changer.password, constants.POSTGRES_CONFIG.databases.game_changer
);
let uot_sequelize = new Sequelize(
	constants.POSTGRES_CONFIG.databases.uot.database, constants.POSTGRES_CONFIG.databases.uot.username, constants.POSTGRES_CONFIG.databases.uot.password, constants.POSTGRES_CONFIG.databases.uot
);

Sequelize.postgres.DECIMAL.parse = function (value) { return parseFloat(value); };

db.uot = uot_sequelize;
db.gc = gc_sequelize;

module.exports = db;
