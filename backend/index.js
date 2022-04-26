'use strict';

require('dotenv').config();
const express = require('express');
const http = require('http');
const fs = require('fs');
const https = require('https'); // module for https
const bodyParser = require('body-parser');
const secureRandom = require('secure-random');
const RSAkeyDecrypt = require('ssh-key-decrypt');
const jwt = require('jsonwebtoken');
const asyncRedisLib = require('async-redis');
const CryptoJS = require('crypto-js');
const Base64 = require('crypto-js/enc-base64');
const constants = require('./node_app/config/constants');
const models = require('./node_app/models');
const User = require('./node_app/models').user;
const Admin = models.admin;
const LOGGER = require('@dod-advana/advana-logger');
const path = require('path');
const { CronJobs } = require('./node_app/lib/cronJobs');
const { Thesaurus } = require('./node_app/lib/thesaurus');
const swaggerUi = require('swagger-ui-express');
const swaggerJSDoc = require('swagger-jsdoc');
const ApiKey = models.api_key;
const CloneMeta = models.clone_meta;
const { SwaggerDefinition, SwaggerOptions } = require('./node_app/controllers/externalAPI/externalAPIController');
const AAA = require('@dod-advana/advana-api-auth');
const { UserController } = require('./node_app/controllers/userController');
const { getUserIdFromSAMLUserId } = require('./node_app/utils/userUtility');
const moment = require('moment');

const app = express();
const jsonParser = bodyParser.json();
const logger = LOGGER;
const port = 8990;
const securePort = 8443;
const userController = new UserController();

const redisAsyncClient = asyncRedisLib.createClient(process.env.REDIS_URL || 'redis://localhost');

// var keyFileData = fs.readFileSync(constants.TLS_KEY_FILEPATH, 'ascii');
const keyFileData = constants.TLS_KEY;
const private_key =
	'-----BEGIN RSA PRIVATE KEY-----\n' +
	RSAkeyDecrypt(keyFileData, constants.TLS_KEY_PASSPHRASE, 'base64')
		.match(/.{1,64}/g)
		.join('\n') +
	'\n-----END RSA PRIVATE KEY-----';

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
			if (envvar.startsWith('REACT_APP_')) result[envvar] = process.env[envvar];
		}

		fs.writeFileSync(path.join(__dirname, './build', 'config.js'), `window.__env__ = ${JSON.stringify(result)}`);
	}
} catch (err) {
	console.error(err);
	console.error('No env variables created');
}

if (constants.EXPRESS_TRUST_PROXY) {
	// https://expressjs.com/en/guide/behind-proxies.html
	app.set('trust proxy', constants.EXPRESS_TRUST_PROXY);
}

app.use(bodyParser.urlencoded({ extended: false }));
app.use(jsonParser);
app.use(express.static(__dirname + '/build'));
app.use('/static', express.static(path.join(__dirname, 'static')));

if (constants.GAME_CHANGER_OPTS.isDemoDeployment) {
	app.use(async function (req, res, next) {
		req.headers['x-env-ssl_client_certificate'] =
			req.get('x-env-ssl_client_certificate') || `CN=${constants.GAME_CHANGER_OPTS.demoUser}`;
		next();
	});
}

app.use(AAA.redisSession());
AAA.setupSaml(app);
app.use(AAA.ensureAuthenticated);

app.use(async function (req, res, next) {
	let user_id;
	if (req.session.user) {
		user_id = getUserIdFromSAMLUserId(req);
		req.permissions = req.session.user.perms;
	} else if (req.user) {
		req.permissions = req.user.perms;
	} else {
		req.permissions = [];
	}

	if (!req.session.user.cn && req.get('SSL_CLIENT_S_DN_CN') === 'ml-api') user_id = 'ml-api';

	await redisAsyncClient.select(12);
	const perms = await redisAsyncClient.get(`${user_id}-perms`);

	if (perms) {
		req.permissions = req.permissions.concat(JSON.parse(perms));
	}

	next();
});

app.use(function (req, res, next) {
	const userId = req.user?.id || req.get('SSL_CLIENT_S_DN_CN');
	logger.http(
		`[${process.env.pm_id || 0}][${req.ip}] [${req.session?.user?.cn || userId}] Request for: ${
			req.protocol
		}://${req.get('host')}${req.originalUrl}`
	);
	AAA.getAllowedOriginMiddleware(req, res, next);
});

// Setting up swagger
const swaggerSpec = swaggerJSDoc(SwaggerDefinition);
app.use('/api/gamechanger/external/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, SwaggerOptions));

// External API Middleware to validate the API Key and pass the user to the headers
app.use('/api/gamechanger/external', async function (req, res, next) {
	if (!req.headers['x-api-key']) {
		res.sendStatus(403);
	} else {
		const [key] = await ApiKey.findAll({
			where: { apiKey: req.headers['x-api-key'] },
			raw: false,
			include: [
				{
					model: CloneMeta,
					attributes: ['clone_name'],
					through: { attributes: [] },
				},
			],
		});
		let cloneAccess;
		if (key) cloneAccess = key.clone_meta.map((clone) => clone.clone_name);
		if (key && key.active && cloneAccess.includes(req.query.cloneName)) {
			req.headers['ssl_client_s_dn_cn'] = key.username;
			req.headers['SSL_CLIENT_S_DN_CN'] = key.username;
			next();
		} else {
			res.sendStatus(403);
		}
	}
});

app.use('/api/gamechanger/external', [
	require('./node_app/routes/externalSearchRouter'),
	require('./node_app/routes/externalGraphRouter'),
]);

app.post('/api/auth/token', async function (req, res) {
	let cn = 'unknown user';
	let perms = ['View gamechanger'];
	const sessUser = req.session.user;
	await redisAsyncClient.select(12);

	try {
		cn = req.session.user.cn;

		let user = await User.findOne({ where: { user_id: getUserIdFromSAMLUserId(req) }, raw: true });

		if (!user || user === null) {
			await userController.updateOrCreateUserHelper(sessUser);
			user = await User.findOne({ where: { user_id: getUserIdFromSAMLUserId(req) }, raw: true });
		}

		// Remove once we feel like most admins have used the new system
		const admin = await Admin.findOne({ where: { username: getUserIdFromSAMLUserId(req) } });

		if (admin) {
			perms.push('Gamechanger Super Admin');
		}

		if (user) {
			if (user.is_super_admin) perms.push('Gamechanger Super Admin');

			let isAdminLite = false;

			// Other attributes in extra_fields other than clone specific
			const fieldsToIgnore = ['clones_visited'];

			Object.keys(user.extra_fields).forEach((extraKey) => {
				if (!fieldsToIgnore.includes(extraKey) && user.extra_fields[extraKey].hasOwnProperty('is_admin')) {
					if (user.extra_fields[extraKey].is_admin) {
						perms.push(`${extraKey} Admin`);
						isAdminLite = true;
					}
				}
			});

			if (isAdminLite) perms.push('Gamechanger Admin Lite');
		}

		sessUser.perms = sessUser.perms.concat(perms);
		sessUser.extra_fields = user.extra_fields;

		const userTokenOld = await redisAsyncClient.get(`${getUserIdFromSAMLUserId(req)}-token`);
		let tokenTimeoutOld = await redisAsyncClient.get(`${getUserIdFromSAMLUserId(req)}-tokenExpiration`);
		let csrfHash;

		if (userTokenOld && tokenTimeoutOld) {
			tokenTimeoutOld = moment(tokenTimeoutOld);
			if (tokenTimeoutOld <= moment()) {
				csrfHash = CryptoJS.SHA256(secureRandom(10)).toString(CryptoJS.enc.Hex);
				const tokenTimeout = moment().add(2, 'days').format();
				await redisAsyncClient.set(`${getUserIdFromSAMLUserId(req)}-token`, csrfHash);
				await redisAsyncClient.set(`${getUserIdFromSAMLUserId(req)}-tokenExpiration`, tokenTimeout);
			} else {
				csrfHash = userTokenOld;
			}
		} else {
			csrfHash = CryptoJS.SHA256(secureRandom(10)).toString(CryptoJS.enc.Hex);
			const tokenTimeout = moment().add(2, 'days').format();
			await redisAsyncClient.set(`${getUserIdFromSAMLUserId(req)}-token`, csrfHash);
			await redisAsyncClient.set(`${getUserIdFromSAMLUserId(req)}-tokenExpiration`, tokenTimeout);
		}

		await redisAsyncClient.set(`${getUserIdFromSAMLUserId(req)}-perms`, JSON.stringify(sessUser.perms));

		const jwtClaims = { ...sessUser };
		jwtClaims['csrf-token'] = csrfHash;
		let token = '';
		token = jwt.sign(jwtClaims, private_key, {
			algorithm: 'RS256',
		});

		res.json({
			token: token,
		});
	} catch (e) {
		logger.error(e.message, '9SuBdeus', cn);
		res.sendStatus(500);
	}
});

app.use(async function (req, res, next) {
	const routesAllowedWithoutToken = [
		'/api/gamechanger/modular/getAllCloneMeta',
		'/api/tutorialOverlay',
		'/api/userAppVersion',
	];

	if (routesAllowedWithoutToken.includes(req.path)) {
		next();
	} else {
		const signatureFromApp = req.get('x-ua-signature');
		await redisAsyncClient.select(12);
		let csrfHash = '';
		if (req.get('SSL_CLIENT_S_DN_CN') === 'ml-api') {
			csrfHash = process.env.ML_WEB_TOKEN || 'Add The Token';
		} else {
			csrfHash = await redisAsyncClient.get(`${getUserIdFromSAMLUserId(req)}-token`);
		}
		if (!csrfHash || csrfHash === '') csrfHash = 'Add The Token';
		const calculatedSignature = CryptoJS.enc.Base64.stringify(CryptoJS.HmacSHA256(req.path, csrfHash));
		if (signatureFromApp === calculatedSignature) {
			next();
		} else {
			if (req.url.includes('getThumbnail')) {
				next();
			} else {
				res.status(403).send({ code: 'not authorized' });
			}
		}
	}
});

app.all('/api/*/admin/*', async function (req, res, next) {
	if (req.permissions.includes('Gamechanger Super Admin') || req.permissions.includes('Webapp Super Admin')) {
		next();
	} else {
		const match = req.permissions.find((perm) => {
			return perm.includes('Admin');
		});

		if (req.get('SSL_CLIENT_S_DN_CN') === 'ml-api') {
			const signatureFromApp = req.get('x-ua-signature');
			const userToken = Base64.stringify(CryptoJS.HmacSHA256(req.path, process.env.ML_WEB_TOKEN));
			if (signatureFromApp === userToken) {
				next();
			} else {
				res.sendStatus(403);
			}
		} else if (match) {
			next();
		} else {
			res.sendStatus(403);
		}
	}
});

app.use('/api/gamechanger', require('./node_app/routes/gameChangerRouter'));

app.use('/api', require('./node_app/routes/advanaRouter'));
app.use('/api/gamechanger/modular', require('./node_app/routes/modularGameChangerRouter'));

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
	logger.error(`Error initializing API request reset cron job: ${e.message}`, 'J6BNFP3', 'Startup Process');
}

try {
	// check for updated favorited search results in the background
	const updateFavorited = cron.getUpdateFavoritedSearchesJob();
	updateFavorited.start();
} catch (e) {
	logger.error(`Error initializing update favorited searches cron job: ${e.message}`, 'Y6DWTX4', 'Startup Process');
}

const options = {
	// key: fs.readFileSync(constants.TLS_KEY_FILEPATH),
	key: constants.TLS_KEY,
	passphrase: constants.TLS_KEY_PASSPHRASE,
	cert: constants.TLS_CERT,
	ca: constants.TLS_CERT_CA,
	requestCert: false,
	rejectUnauthorized: false,
};

https.createServer(options, app).listen(securePort);
http.createServer(app).listen(port);

// shoutout to the user
logger.boot(`
====> Root Clone? ${constants.GAME_CHANGER_OPTS.rootClone}
====> http port: ${port}
====> https port: ${securePort}
====> Environment: ${process.env.REACT_APP_NODE_ENV === undefined ? 'production' : process.env.REACT_APP_NODE_ENV}
====> SSO enabled: ${process.env.REACT_APP_GLUU_SSO === 'disabled' ? 'no' : 'yes'}
====> Using Kerberos: ${process.env.APP_USE_KERBEROS === 'true' ? 'yes' : 'no'}
====> Using Docker: ${process.env.DOCKER === 'true' ? 'yes' : 'no'}
====> Redis url: ${process.env.REDIS_URL || 'redis://localhost'}
====> game_changer postgres host: ${process.env.POSTGRES_HOST_GAME_CHANGER}
====> gc-orchestration postgres host: ${process.env.POSTGRES_HOST_GC_ORCHESTRATION}
====> uot postgres host: ${process.env.POSTGRES_HOST_UOT}
====> module postgres host: ${process.env.PG_HOST}
`);

if (process.env.PRINT_ROUTES === 'true') {
	let routers = {};
	routers['/'] = app._router;
	routers['/api/gamechanger'] = require('./node_app/routes/gameChangerRouter');
	routers['/api/gamechanger/external'] = require('./node_app/routes/externalGraphRouter');
	routers['//api/gamechanger/external'] = require('./node_app/routes/externalSearchRouter');
	routers['/api'] = require('./node_app/routes/advanaRouter');
	routers['/api/gamechanger/modular'] = require('./node_app/routes/modularGameChangerRouter');

	let output = 'Route\n';
	for (let base in routers) {
		routers[base].stack.forEach(function (r) {
			if (r.route && r.route.path && !r.route.path.includes('*')) {
				output += `${base}${r.route.path}\n`.replace(/\/\//g, '/');
			}
		});
	}
	fs.writeFile(__dirname + '/security_scan/route_check/routes.csv', output, (err) => {
		if (err) {
			console.error(err);
		}
	});
}

setInterval(() => {
	logger.info(`---> Process ${process.env.pm_id || 0}` + ' tick');
}, 10000);
