'use strict';
const winston = require('winston');
const fs = require('fs');
const _ = require('underscore');
const path = require('path');
const stripAnsi = require('strip-ansi');
const constants = require('../config/constants');
const permissions = require('../controllers/permissions');

const { LOG_FOLDER, LOG_FILE, EDL_UPLOAD_DIRECTORY} = constants;
const { LOG_LEVELS } = constants;

let logger = {};
const logLevels = LOG_LEVELS;
const os = require('os');
// see logLevels.levels for complete list. 'debug' is the most verbose
//                 should be 'http' for production
const DEFAULT_LOG_LEVEL = 'debug';

winston.addColors(logLevels);


class UoTLogger {
	static checkDirectorySync(directory) {
		try {
			fs.statSync(directory);
		} catch (e) {
			try {
				fs.mkdirSync(directory);
			} catch(e) {
				console.log('----------------- FAILED TO MAKE LOGGER DIRECTORY', directory)
			}
		}
	}

	// Concise example of how simple it is to send an endless stream of data to the browser
	// https://truffles.me.uk/real-time-the-easy-way-with-eventsource
	static sendSse(name, data, id, res) {
		res.write('event: ' + name + '\n');
		if (id) res.write('id: ' + id + '\n');
		res.write('data: ' + JSON.stringify(data) + '\n\n');
	}


	static getConsoleFormatter() {
		return winston.format.combine(
			winston.format.colorize(),
			winston.format.timestamp(),
			// winston.format.align(),
			winston.format.printf((info) => {
				const {
					timestamp, level, message
				} = info;

				const ts = timestamp.replace('T', ' ').replace('Z', '');
				return `${ts} [${level}]: ${message}`;
			}));
	}

	static getFileFormatter() {
		return winston.format.combine(
			winston.format.timestamp(),
			winston.format.printf(info => {
				return JSON.stringify(info);
			})
		);
	}

	static getFileTransportsPerLevel(logFile, levels = LOG_LEVELS.levels) {
		const logFileBase = logFile.replace('.log', '');
		return _.map(levels, (idx, level) => new winston.transports.File({
			filename: `${logFileBase}.${level}.log`,
			level,
			colorize: false,
			format: winston.format.combine(
				winston.format.timestamp(),
				// winston.format.align(),
				winston.format.printf((info) => {
					const {
						timestamp, level, message
					} = info;


					const ts = timestamp.replace('T', ' ').replace('Z', '');


					return stripAnsi(`${ts} [${level}]: ${message}`);
				}))
		}));
	}

}

try {
	logger = winston.createLogger({
		level: DEFAULT_LOG_LEVEL,
		levels: logLevels.levels,
		format: UoTLogger.getConsoleFormatter(),
		transports: [
			new winston.transports.File({filename: LOG_FILE + '.log'}),
			new winston.transports.File({filename: LOG_FILE + '.error', level: 'error'}),
			new winston.transports.Console()
		],
		exceptionHandlers: [
			new winston.transports.File({filename: LOG_FILE + '.log', level: 'error'}),
			new winston.transports.File({filename: LOG_FILE + '.error', level: 'error'}),
			new winston.transports.Console()
		]
	});
} catch (e) {
	// mock logger for dev env and when running tests
	logger.boot = () => {};
	logger.database = () => {};
	logger.log = () => {};
	logger.info = () => {};
}


logger.error = (error, code, user) => {
	let message = '';
	if (error instanceof Error) {
		message = error.message
	}
	message += (user) ? `[${user}]` : '';
	message += (code) ? `[${code}] ` : '';
	logger.log('error', message + error);
};

/**
 * Logs a metrics level message to the logs.
 * @param {string} event the event to log
 * @param {string?} info optional info for event
 */
logger.metrics = (event = 'NOEVENTPASSED', info) => {
	try {
		logger.log('metrics', JSON.stringify({ event, info }));
	} catch (e) {
		logger.log('metrics', `metrics stringify err || ${event} :: ${info}`);
	}
};

logger.tracing = (function() {
	let components = {};
	let exact = false;
	const resp = (res, msg) => { res.status(200).send(`${msg}<br>Process ${process.env.pm_id || 0}<br>HOST_ID ${process.env.HOST_ID}<br>hostname ${os.hostname()}`); };

	return {
		add: (req, res) => {
			if (process.env.REACT_APP_NODE_ENV === undefined) {
				if (!permissions.isSuperAdmin(req)) return res.status(403).send({ message: 'Permisson denied'});
			}
			let component = req.query.component;
			let level = req.query.level;
			let exists = false;
			if (component === undefined || component === '') resp(res, 'Required query parameter "component" is missing');
			if (components[component] === undefined) components[component] = { levels: [] };
			if (level === undefined) return resp(res, `Added component "${component}"`);
			level = parseInt(level);
			components[component].levels.forEach(v => { if (level === v) exists = true; });
			if (exists) return resp(res, `Level ${level} already exists for component "${component}"`);
			components[component].levels.push(level);
			components[component].levels.sort((a, b) => { return a - b; });
			return resp(res, `Added level ${level} for component "${component}"`);
		},
		clear: (req, res) => {
			if (process.env.REACT_APP_NODE_ENV === undefined) {
				if (!permissions.isSuperAdmin(req)) return res.status(403).send({ message: 'Permisson denied'});
			}
			components = {};
			return resp(res, 'Cleared all components');
		},
		exact: (req, res) => {
			if (process.env.REACT_APP_NODE_ENV === undefined) {
				if (!permissions.isSuperAdmin(req)) return res.status(403).send({ message: 'Permisson denied'});
			}
			if (_.includes(['true', 'false'], req.query.value.toLowerCase())) {
				exact = (req.query.value.toLowerCase() === 'true');
				resp(res, `Value of exact set to ${req.query.value.toLowerCase()}`);
			}
		},
		list: (req, res) => {
			if (process.env.REACT_APP_NODE_ENV === undefined) {
				if (!permissions.isSuperAdmin(req)) return res.status(403).send({ message: 'Permisson denied'});
			}
			return resp(res, `Components: ${JSON.stringify(components)}`);
		},
		remove: (req, res) => {
			if (process.env.REACT_APP_NODE_ENV === undefined) {
				if (!permissions.isSuperAdmin(req)) return res.status(403).send({ message: 'Permisson denied'});
			}
			let component = req.query.component;
			let level = req.query.level;
			if (component === undefined) return resp(res, `Component must be provided`);
			if (components[component] === undefined) return resp(res, `Component "${component}" doesn't exist`);
			if (level === undefined) {
				delete components[component];
				return resp(res, `Deleted component "${component}"`);
			}
			level = parseInt(level);
			let len = components[component].levels.length;
			components[component].levels = components[component].levels.filter(v => { return v !== level; });
			if (components[component].levels.length === len) return resp(res, `Level ${level} for component "${component}" doesn't exist`);
			return resp(res, `Deleted level ${level} for component "${component}"`);
		},
		trace: (message, component, level) => {
			if (components[component] === undefined) return;
			if (level === undefined) {
				logger.info(message);
			} else if (exact) {
				components[component].levels.forEach(v => { if (v === level) logger.info(message); });
			} else {
				if (components[component].levels.length === 0 || level <= _.last(components[component].levels)) logger.info(message);
			}
		}
	};
})();

logger.trace = (message, component, level) => {
	logger.tracing.trace(message, component, level);
};

const edlLogCache = {};
let logStreamStore = {};

class EdlLogFactory {

	static createEdlLogFileIfNotExist(identifier) {
		identifier = identifier || 'log';
		const edlDirectory = path.join(EDL_UPLOAD_DIRECTORY, identifier);
		const file = path.join(edlDirectory, 'log.log');

		if (!fs.existsSync(file)) {
			UoTLogger.checkDirectorySync(edlDirectory);
			fs.writeFile(file, '', { flag: 'wx' }, function (err) {
				if (err) logger.error('Error creating new log file', { err, identifier, file });
				logger.debug('Created new log file', { identifier, file });
			});
		}
		return file;
	}

	static getEdlLogLocation(identifier) {
		identifier = identifier || 'log';
		const file = EdlLogFactory.createEdlLogFileIfNotExist(identifier);
		return file;
	}

	static getEdlLog(identifier) {
		identifier = identifier || 'log';
		if (edlLogCache[identifier]) {
			return edlLogCache[identifier];
		}

		const logFile = EdlLogFactory.getEdlLogLocation(identifier);
		const newLog = winston.createLogger({
			level: 'http',
			levels: LOG_LEVELS.levels,
			format: UoTLogger.getFileFormatter(),
			transports: [
				//
				// - Write to all logs with level `info` and below to `combined.log`
				// - Write all logs error (and below) to `error.log`.
				//
				new winston.transports.File({ filename: logFile, level: 'http' }),
				new winston.transports.File({ filename: logFile + '.error', level: 'error' }),
				new winston.transports.Console({ format: UoTLogger.getConsoleFormatter() })
			]
		});

		edlLogCache[identifier] = newLog;
		return newLog;
	}

	static getEdlLogOutput({ userId, identifier, res }) {
		const filename = EdlLogFactory.getEdlLogLocation(identifier);

		res.writeHead(200, {
			'Content-Type': 'text/event-stream',
			'Cache-Control': 'no-cache',
			Connection: 'keep-alive',
		});

		let log;
		const cacheLog = logStreamStore[userId];
		const transporter = new winston.transports.File({ filename, level: 'http' });
		if (cacheLog) {
			cacheLog.clear();
			cacheLog.add(transporter);
			log = cacheLog;
			logger.debug('Existing stream in play, returning', { userId, identifier });
		} else {
			log = winston.createLogger({
				level: 'http',
				levels: LOG_LEVELS.levels,
				format: UoTLogger.getFileFormatter(),
				transports: [transporter]
			});
			logStreamStore[userId] = log;
			logger.streamOPEN('New stream open', { userId, identifier });
		}

		transporter.stream({ start: -1 }).on('log', (info) => UoTLogger.sendSse('message', info, null, res));
		logger.streamOPEN(`Current open streams in cache`, { count: _.keys(logStreamStore).length });
	}
}

process.on('uncaughtException', function (error) {
	logger.error(`Uncaught exception has occurred ${error}`);
	logger.error(error.stack);
	console.log(`Uncaught exception has occurred ${error}`);
	console.log(error.stack);
});

UoTLogger.checkDirectorySync(LOG_FOLDER);
logger.getEdlLog = EdlLogFactory.getEdlLog;
logger.getEdlLogOutput = EdlLogFactory.getEdlLogOutput;
logger.EdlLogFactory = EdlLogFactory;
logger.UoTLogger = UoTLogger;
module.exports = logger;
