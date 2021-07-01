'use strict';
const fs = require('fs');
const path = require('path');
const { Sequelize, DataTypes } = require('sequelize');
const basename = path.basename(module.filename);
const constants = require('../config/constants.js');
const db = {};

// Extract the database information into an array
const databases = Object.keys(constants.POSTGRES_CONFIG.databases);

// Loop over the array and create a new Sequelize instance for every database from config.js
for (let i = 0; i < databases.length; ++i) {
	let database = databases[i];
	let dbPath = constants.POSTGRES_CONFIG.databases[database];
	// Store the database connection in our db object
	db[database] = new Sequelize(dbPath.database, dbPath.username, dbPath.password, dbPath);
}

Sequelize.postgres.DECIMAL.parse = function (value) { return parseFloat(value); };

// Add models from game_changer folder
fs
	.readdirSync(__dirname + '/game_changer')
	.filter(file =>
		(file.indexOf('.') !== 0) &&
        (file !== basename) &&
        (file.slice(-3) === '.js'))
	.forEach(file => {
		// const model = db.game_changer.import(path.join(__dirname + '/game_changer', file));
		const model = require(path.join(__dirname + '/game_changer', file))(db['game_changer'], DataTypes);
		db[model.name] = model;
	});

// Add models from gc-orchestration folder
fs
	.readdirSync(__dirname + '/gc-orchestration')
	.filter(file =>
		(file.indexOf('.') !== 0) &&
        (file !== basename) &&
        (file.slice(-3) === '.js'))
	.forEach(file => {
		// const model = db['gc-orchestration'].import(path.join(__dirname + '/gc-orchestration', file));
		const model = require(path.join(__dirname + '/gc-orchestration', file))(db['gc-orchestration'], DataTypes);
		db[model.name] = model;
	});

// Add models from uot folder
fs
	.readdirSync(__dirname + '/uot')
	.filter(file =>
		(file.indexOf('.') !== 0) &&
        (file !== basename) &&
        (file.slice(-3) === '.js'))
	.forEach(file => {
		// const model = db['gc-orchestration'].import(path.join(__dirname + '/gc-orchestration', file));
		const model = require(path.join(__dirname + '/uot', file))(db['uot'], DataTypes);
		db[model.name] = model;
	});


Object.keys(db).forEach(modelName => {
	if (db[modelName].associate) {
		db[modelName].associate(db);
	}
});

module.exports = db;
