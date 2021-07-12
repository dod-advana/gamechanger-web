'use strict';

require('dotenv').config();
const express = require('express');
const passport = require('passport');
const ldapStrategy = require('passport-ldapauth');
const http = require('http');
const fs = require('fs');
const https = require('https'); // module for https
const session = require('express-session');
const bodyParser = require('body-parser');
const secureRandom = require('secure-random');
const RSAkeyDecrypt = require('ssh-key-decrypt');
const _ = require('lodash');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const redis = require('redis');
const asyncRedisLib = require('async-redis');
const client = redis.createClient(process.env.REDIS_URL || 'redis://localhost');
const CryptoJS = require('crypto-js');
const Base64 = require('crypto-js/enc-base64');
const constants = require('./node_app/config/constants');
const models = require('./node_app/models');
const Admin = models.admin;
const LOGGER = require('./node_app/lib/logger');
const path = require('path');
const { CronJobs } = require('./node_app/lib/cronJobs');
const { Thesaurus } = require('./node_app/lib/thesaurus');
const swaggerUi = require('swagger-ui-express');
const swaggerJSDoc = require('swagger-jsdoc');
const ApiKey = models.api_key;
const { SwaggerDefinition, SwaggerOptions } = require('./node_app/controllers/externalAPI/externalAPIController');
const AAA = require('advana-api-auth');

const app = express();
const jsonParser = bodyParser.json();
const logger = LOGGER;
const port = 8990;
const securePort = 8443;

const redisAsyncClient = asyncRedisLib.createClient(process.env.REDIS_URL || 'redis://localhost');

// var keyFileData = fs.readFileSync(constants.TLS_KEY_FILEPATH, 'ascii');
var keyFileData = constants.TLS_KEY;
var private_key = '-----BEGIN RSA PRIVATE KEY-----\n' + (RSAkeyDecrypt(keyFileData, constants.TLS_KEY_PASSPHRASE, 'base64')).match(/.{1,64}/g).join('\n') + '\n-----END RSA PRIVATE KEY-----';


logger.boot(`
                
     #          
     & &        
     & (( &     
     & (((% &&  
    && &* &((( &       ______    ______   __       __  ________   ______   __    __   ______   __    __   ______   ________  _______  
  &.& ### &((( &      /      \\  /      \\ |  \\     /  \\|        \\ /      \\ |  \\  |  \\ /      \\ |  \\  |  \\ /      \\ |        \\|       \\ 
&&*###### &((( &     |  $$$$$$\\|  $$$$$$\\| $$\\   /  $$| $$$$$$$$|  $$$$$$\\| $$  | $$|  $$$$$$\\| $$\\ | $$|  $$$$$$\\| $$$$$$$$| $$$$$$$\\
&/####### &((( &     | $$ __\\$$| $$__| $$| $$$\\ /  $$$| $$__    | $$   \\$$| $$__| $$| $$__| $$| $$$\\| $$| $$ __\\$$| $$__    | $$__| $$
&/####### &((( &     | $$|    \\| $$    $$| $$$$\\  $$$$| $$  \\   | $$      | $$    $$| $$    $$| $$$$\\ $$| $$|    \\| $$  \\   | $$    $$
&/####### &((( &     | $$ \\$$$$| $$$$$$$$| $$\\$$ $$ $$| $$$$$   | $$   __ | $$$$$$$$| $$$$$$$$| $$\\$$ $$| $$ \\$$$$| $$$$$   | $$$$$$$\\
&/####### &((( &     | $$__| $$| $$  | $$| $$ \\$$$| $$| $$_____ | $$__/  \\| $$  | $$| $$  | $$| $$ \\$$$$| $$__| $$| $$_____ | $$  | $$
&/####### &((&        \\$$    $$| $$  | $$| $$  \\$ | $$| $$     \\ \\$$    $$| $$  | $$| $$  | $$| $$  \\$$$ \\$$    $$| $$     \\| $$  | $$
&/####### &            \\$$$$$$  \\$$   \\$$ \\$$      \\$$ \\$$$$$$$$  \\$$$$$$  \\$$   \\$$ \\$$   \\$$ \\$$   \\$$  \\$$$$$$  \\$$$$$$$$ \\$$   \\$$
`);

const thes = new Thesaurus();
thes.waitForLoad().then(() => {
	console.log(thes.lookUp('win'));
});

try {
	if (process.env.DISABLE_FRONT_END_CONFIG !== 'true') {
		let result = {};

		for (let envvar in process.env) {
			if (envvar.startsWith('REACT_APP_'))
				result[envvar] = process.env[envvar];
		};

		fs.writeFileSync(
			path.join(__dirname, "./build", "config.js"),
			`window.__env__ = ${JSON.stringify(result)}`
		);
	}

} catch (err) {
	console.error(err);
	console.error('No env variables created')
}

app.use(bodyParser.urlencoded({ extended: false }));
app.use(jsonParser);
app.use(express.static(__dirname + '/build'));
app.use('/static', express.static(path.join(__dirname, 'static')));

if (constants.GAME_CHANGER_OPTS.isDecoupled) {
	app.use(async function (req, res, next) {
		const cn = req.get('x-env-ssl_client_certificate');
		if (!cn) {
			res.sendStatus(401);
		} else {
			req.user = { cn: cn.replace(/.*CN=(.*)/g, '$1') };
			req.headers['ssl_client_s_dn_cn'] = cn;
			req.headers['SSL_CLIENT_S_DN_CN'] = cn;

			redisAsyncClient.select(12);
			const perms = await redisAsyncClient.get(`${req.user.cn}-perms`);

			if (perms) {
				req.permissions = perms;
			} else {
				req.permissions = [];
			}
			next();
		}
	});
} else {
	app.use(AAA.redisSession());
	AAA.setupSaml(app)
	app.use(AAA.ensureAuthenticated);

	app.use(async function (req, res, next) {
		if (req.user) { req.headers['ssl_client_s_dn_cn'] = req.user.id; };
		if(req.session && req.session.user) {req.permissions = req.session.user.perms;}
		next();
	});
}

app.use(function (req, res, next) {
	let approvedClients = constants.APPROVED_API_CALLERS;
	const { headers, hostname } = req;
	const { origin } = headers;
	const userId = constants.GAME_CHANGER_OPTS.isDecoupled ? req.get('x-env-ssl_client_certificate') : req.get('SSL_CLIENT_S_DN_CN');
	logger.http(`[${process.env.pm_id || 0}][${req.ip}] [${userId}] Request for: ${req.protocol}://${req.get('host')}${req.originalUrl}`);
	if (approvedClients.includes(hostname)) {
		res.setHeader('Access-Control-Allow-Origin', hostname);
	} else if (origin) {
		res.setHeader('Access-Control-Allow-Origin', origin);
	}
	// res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');
	// res.header('Access-Control-Allow-Headers', 'Accept, Origin, Content-Type, Authorization, Content-Length, X-Requested-With, Accept-Language, SSL_CLIENT_S_DN_CN, x-env-ssl_client_certificate');
	res.header('Access-Control-Allow-Headers', 'Accept, Origin, Content-Type, Authorization, Content-Length, X-Requested-With, Accept-Language, SSL_CLIENT_S_DN_CN, X-UA-SIGNATURE, permissions');
	res.header('Access-Control-Allow-Credentials', true);
	res.header('Access-Control-Expose-Headers', 'Content-Disposition');
	// intercepts OPTIONS method
	if (req.method === 'OPTIONS') {
		res.sendStatus(200);
	} else {
		if(!req.permissions) {
			req.permissions = [];
		}
		next();
	}
});

if (constants.GAME_CHANGER_OPTS.isDecoupled) {
	// Setting up swagger
	const swaggerSpec = swaggerJSDoc(SwaggerDefinition);
	app.use('/api/gamechanger/external/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, SwaggerOptions));

	// External API Middleware to validate the API Key and pass the user to the headers
	app.use('/api/gamechanger/external', async function (req, res, next) {
		if (!req.headers['x-api-key']) {
			res.sendStatus(403);
		} else {
			const key = await ApiKey.findAll({ where: { apiKey: req.headers['x-api-key'] }, raw: true });
			if (key && key.active) {
				req.headers['ssl_client_s_dn_cn'] = key.username;
				req.headers['SSL_CLIENT_S_DN_CN'] = key.username;
				next();
			} else {
				res.sendStatus(403);
			}
		}
	});

	app.use('/api/gamechanger/external', [require('./node_app/routes/externalSearchRouter'), require('./node_app/routes/externalGraphRouter')]);
}

app.post('/api/auth/token', async function (req, res) {

	if (constants.GAME_CHANGER_OPTS.isDecoupled) {
		let cn = 'unknown user';
		let perms = [''];
		try {
			cn = req.user.cn;
			const admin = await Admin.findOne({ where: { username: cn } });

			if (admin) {
				perms = ['Gamechanger Admin'];
			}
		} catch (e) {
			logger.error(e.message, '9SuBdeus', cn);
			res.sendStatus(500);
		}

		const csrfHash = CryptoJS.SHA256(secureRandom(10)).toString(CryptoJS.enc.Hex);

		const jwtClaims = { perms, cn };

		jwtClaims['csrf-token'] = csrfHash;
		let token = '';
		try {
			token = jwt.sign(jwtClaims, private_key, {
				algorithm: 'RS256'
			});

			redisAsyncClient.select(12);
			await redisAsyncClient.set(`${cn}-token`, token);
			await redisAsyncClient.set(`${cn}-perms`, perms);

			res.json({
				token: token
			});
		} catch (e) {
			logger.error(e.message, '9SuBdeut', cn);
			res.sendStatus(500);
		}
	} else {
		AAA.getToken(req, res);
	}
});

if (constants.GAME_CHANGER_OPTS.isDecoupled) {
	app.use(async function (req, res, next) {
		const signatureFromApp = req.get('x-ua-signature');
		redisAsyncClient.select(12);
		const userToken = await redisAsyncClient.get(`${req.user.cn}-token`);
		const calculatedSignature = Base64.stringify(CryptoJS.SHA256(req.path, userToken));
		if (signatureFromApp === calculatedSignature) {
			next();
		} else {
			if (req.url.includes('getThumbnail')) {
				next();
			}
			else {
				res.status(403).send({ code: 'not authorized' });
			}
		}
	});
}

app.all('/api/*/admin/*', async function (req, res, next) {
	if (req.permissions.includes('Gamechanger Admin') || req.permissions.includes('Webapp Super Admin')) {
		next();
	} else {
		res.sendStatus(403);
	}
});

const cron = new CronJobs();
try {
	// setup cron job to reload cache nightly
	const reload = cron.getReloadJob();
	reload.start();
} catch (e) {
	logger.error(`Error initializing cache reload cron job: ${e.message}`, 'H4QKA6F', 'Startup Process');
}

try {
	// reset API Request limit on first of month
	const reset = cron.resetAPIRequestLimitJob();
	reset.start();
} catch (e) {
	logger.error(`Error initializing API request reset cron job: ${e.message}`, 'J6BNFP3', 'Startup Process')
}

app.use('/api/gamechanger', require('./node_app/routes/gameChangerRouter'));

app.use('/api', require('./node_app/routes/advanaRouter'));
app.use('/api/gamechanger/modular', require('./node_app/routes/modularGameChangerRouter'));

const options = {
	// key: fs.readFileSync(constants.TLS_KEY_FILEPATH),
	key: constants.TLS_KEY,
	passphrase: constants.TLS_KEY_PASSPHRASE,
	cert: constants.TLS_CERT,
	ca: constants.TLS_CERT_CA,
	requestCert: false,
	rejectUnauthorized: false
};

https.createServer(options, app).listen(securePort);
http.createServer(app).listen(port);

// shoutout to the user
logger.boot(`
====> App version: ${constants.VERSION}
====> Is decoupled? ${constants.GAME_CHANGER_OPTS.isDecoupled}
====> http port: ${port}
====> https port: ${securePort}
====> Environment: ${process.env.REACT_APP_NODE_ENV === undefined ? 'production' : process.env.REACT_APP_NODE_ENV}
====> SSO enabled: ${process.env.REACT_APP_GLUU_SSO === 'disabled' ? 'no' : 'yes'}
====> Using Kerberos: ${process.env.APP_USE_KERBEROS === 'true' ? 'yes' : 'no'}
====> Using Docker: ${process.env.DOCKER === 'true' ? 'yes' : 'no'}
====> Redis url: ${process.env.REDIS_URL || 'redis://localhost'}
====> Postgres host: ${constants.POSTGRES_CONFIG.host}
====> Postgres port: ${constants.POSTGRES_CONFIG.port}
`);

if(process.env.PRINT_ROUTES === 'true') {
	let routers = {};
	routers['http://localhost:8990'] = app._router;
	routers['http://localhost:8990/api/gamechanger'] = require('./node_app/routes/gameChangerRouter');
	routers['http://localhost:8990/api/gamechanger/external'] = require('./node_app/routes/externalGraphRouter');
	routers['http://localhost:8990//api/gamechanger/external'] = require('./node_app/routes/externalSearchRouter');
	routers['http://localhost:8990/api'] = require('./node_app/routes/advanaRouter');
	routers['http://localhost:8990/api/gamechanger/modular'] = require('./node_app/routes/modularGameChangerRouter');

	console.log('BEGIN ROUTES');
	for(let base in routers) {
		routers[base].stack.forEach(function(r){
		if (r.route && r.route.path && !r.route.path.includes('*')){
			console.log(`${base}${r.route.path}`.replace(/\/\//g, '/'));
		}
		});
	}
	console.log('END ROUTES');
}

setInterval(() => { logger.info(`---> Process ${process.env.pm_id || 0}` + ' tick'); }, 10000);
