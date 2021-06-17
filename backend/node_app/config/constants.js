var path = require('path');
const dataCatalogConfig = require('./datacatalog');

module.exports = Object.freeze({
	VERSION: '#DYNAMIC_VERSION',
	APPROVED_API_CALLERS: process.env.APPROVED_API_CALLERS ? process.env.APPROVED_API_CALLERS.split(' ') : [],
	TLS_CERT: process.env.TLS_CERT ? process.env.TLS_CERT.replace(/\\n/g, '\n') : '',
	TLS_CERT_CA: process.env.TLS_CERT_CA ? process.env.TLS_CERT_CA.replace(/\\n/g, '\n') : '',
	TLS_KEY: process.env.TLS_KEY ? process.env.TLS_KEY.replace(/\\n/g, '\n') : '',
	POSTGRES_CONFIG: {
		databases: {
			game_changer: {
				username: process.env.POSTGRES_USER_GAME_CHANGER,
				password: process.env.POSTGRES_PASSWORD_GAME_CHANGER,
				database: 'game_changer',
				data_api_database: 'data_api',
				host: process.env.POSTGRES_HOST_GAME_CHANGER,
				port: 5432,
				dialect: 'postgres',
				logging: false
			},
			'gc-orchestration': {
				username: process.env.POSTGRES_USER_GC_ORCHESTRATION,
				password: process.env.POSTGRES_PASSWORD_GC_ORCHESTRATION,
				database: 'gc-orchestration',
				host: process.env.POSTGRES_HOST_GC_ORCHESTRATION,
				port: 5432,
				dialect: 'postgres',
				logging: false
			},
			uot: {
				username: process.env.POSTGRES_USER_UOT,
				password: process.env.POSTGRES_PASSWORD_UOT,
				database: 'uot',
				host: process.env.POSTGRES_HOST_UOT,
				port: 5432,
				dialect: 'postgres',
				logging: false
			}
		}
	},
	GAMECHANGER_BACKEND_BASE_URL: `http://${process.env.GAMECHANGER_BACKEND_HOST}:8990`,
	GAMECHANGER_BACKEND_EDA_URL: `http://${process.env.EDA_DATA_HOST}:8990`,
	EDL_UPLOAD_DIRECTORY: path.dirname(require.main.filename) + '/volumes/uploads/',
	LOG_FILE: path.dirname(require.main.filename) + '/logs/gc-node-api/gc-node-api',
	LOG_FOLDER: path.dirname(require.main.filename) + '/logs/',
	GAME_CHANGER_OPTS: {
		isDecoupled: process.env.REACT_APP_GC_DECOUPLED === 'true',
		version: 'game_changer',
		impalaTable: 'policy_analytics.gc_history',
		protocol: 'http',
		downloadLimit: 5000,
		s3Dest: 'advana-raw-zone',
		s3Path: '/gamechanger/json',
		index: 'gamechanger',
		emailAddress: process.env.EMAIL_ADDRESS,
		cacheReloadUserId: 'gc-auto-cache-reload',
		cacheReloadCronTimingPattern: '0 0 * * *',
		allow_daterange: true,
		historyIndex: process.env.GAMECHANGER_ELASTICSEARCH_HISTORY_INDEX,
		entityIndex: process.env.GAMECHANGER_ELASTICSEARCH_ENTITIES_INDEX,
		textSuggestIndex: process.env.GAMECHANGER_ELASTICSEARCH_SUGGEST_INDEX
	},
	GAMECHANGER_ML_API_BASE_URL: `http://${process.env.GAMECHANGER_ML_API_HOST}:5000`,
	ADVANA_EMAIL_CONTACT_NAME: 'Advana Do Not Reply',
	ADVANA_NOREPLY_EMAIL_ADDRESS: 'no-reply@boozallencsn.com',
	ADVANA_EMAIL_TRANSPORT_OPTIONS: {
		host: process.env.EMAIL_TRANSPORT_HOST,
		port: process.env.EMAIL_TRANSPORT_PORT,
		secure: false,
		tls: {
			rejectUnauthorized: false
		}
	},
	GAMECHANGER_ELASTIC_SEARCH_OPTS: {
		useElasticSearch: true,
		protocol: process.env.GAMECHANGER_ELASTICSEARCH_PROTOCOL,
		host: process.env.GAMECHANGER_ELASTICSEARCH_HOST,
		port: process.env.GAMECHANGER_ELASTICSEARCH_PORT,
		user: process.env.GAMECHANGER_ELASTICSEARCH_USER ? process.env.GAMECHANGER_ELASTICSEARCH_USER : '',
		password: process.env.GAMECHANGER_ELASTICSEARCH_PASSWORD,
		ca: process.env.GAMECHANGER_ELASTICSEARCH_CA ? process.env.GAMECHANGER_ELASTICSEARCH_CA.replace(/\\n/g, '\n') : '',
		index: process.env.GAMECHANGER_ELASTICSEARCH_INDEX,
		history_index: 'search_history',
		requestTimeout: 60000
	},
	EDA_ELASTIC_SEARCH_OPTS: {
		protocol: process.env.EDA_ELASTICSEARCH_PROTOCOL,
		host: process.env.EDA_ELASTICSEARCH_HOST,
		port: process.env.EDA_ELASTICSEARCH_PORT,
		user: process.env.EDA_ELASTICSEARCH_USER ? process.env.EDA_ELASTICSEARCH_USER : '',
		password: process.env.EDA_ELASTICSEARCH_PASSWORD,
		ca: process.env.EDA_ELASTICSEARCH_CA ? process.env.EDA_ELASTICSEARCH_CA.replace(/\\n/g, '\n') : '',
		index: process.env.EDA_ELASTICSEARCH_INDEX,
		extSearchFields:['*_eda_ext'],//['acomod_eda_ext','product_or_service_line_item_eda_ext'],
		extRetrieveFields:['*_eda_ext'],
		// index: 'eda'
		requestTimeout: 60000
	},

	S3_REGION: process.env.S3_REGION ? process.env.S3_REGION : undefined,
	GRAPH_DB_CONFIG: {
		url: process.env.NEO4J_URL,
		user: process.env.NEO4J_USER,
		password:  process.env.NEO4J_PASSWORD
	},
	MATOMO_DB_CONFIG: {
		host: process.env.MYSQL_HOST_MATOMO,
		user: process.env.MYSQL_USER_MATOMO,
		password: process.env.MYSQL_PASSWORD_MATOMO,
		database: 'matomo'
	},
	HERMES_ELASTIC_SEARCH_OPTS: {
		index: process.env.HERMES_ELASTICSEARCH_INDEX,
		auxSearchFields: [''],
		auxRetrieveFields: ['']
	},
	QLIK_OPTS: {
		QLIK_URL: process.env.QLIK_URL,
		QLIK_WS_URL: process.env.QLIK_WS_URL,
		CA: process.env.QLIK_CERT_CA ? process.env.QLIK_CERT_CA.replace(/\\n/g, '\n') : '',
		KEY:  process.env.QLIK_CERT_KEY ? process.env.QLIK_CERT_KEY.replace(/\\n/g, '\n') : '',
		CERT:  process.env.QLIK_CERT_KEY ? process.env.QLIK_CERT.replace(/\\n/g, '\n') : '',
		QLIK_SYS_ACCOUNT: process.env.QLIK_SYS_ACCOUNT,
		AD_DOMAIN: process.env.QLIK_AD_DOMAIN
	},
	DATA_CATALOG_OPTS: {
		port: process.env.DATA_CATALOG_PORT,
		protocol: 'http',
		host: process.env.DATA_CATALOG_HOST,
		core_rest_path: '/rest/2.0',
		username: process.env.DATA_CATALOG_USER,
		password: process.env.DATA_CATALOG_PASSWORD,
		api_config: dataCatalogConfig,
		ca: process.env.DATA_CATALOG_CA ? process.env.DATA_CATALOG_CA.replace(/\\n/g, '\n') : ''
		},
	TLS_KEY_PASSPHRASE: process.env.TLS_KEY_PASSPHRASE,
	LOG_LEVELS: {
		levels: {
			error: 0,
			warn: 1,
			info: 2,
			metrics: 3,
			boot: 3,
			chunkAssembly: 4,
			chunkPOST: 5,
			unzipping: 6,
			completed: 7,
			chunkGET: 8,
			database: 9,
			http: 9,
			streamOPEN: 10,
			streamCLOSE: 10,
			debug: 11,
		},
		colors: {
			error: 'red',
			warn: 'yellow',
			info: 'cyan',
			metrics: 'blue',
			chunkGET: 'yellow',
			chunkPOST: 'blue',
			chunkAssembly: 'blue',
			unzipping: 'cyan',
			completed: 'green',
			database: 'magenta',
			boot: 'magenta',
			streamOPEN: 'red',
			streamCLOSE: 'red',
			debug: 'red'
		},
	},
	SERVICEDESK_ID: 5,
	SERVICE_ACCOUNT_OPTS: {
		USERNAME: process.env.SERVICE_ACCOUNT_USER,
		PASSWORD: process.env.SERVICE_ACCOUNT_PASSWORD,
		EMAIL: process.env.SERVICE_ACCOUNT_EMAIL,
		PHONE: process.env.SERVICE_ACCOUNT_PHONE,
		ORGANIZATION: process.env.SERVICE_ACCOUNT_ORG,
		ENVIRONMENT: process.env.SERVICE_ACCOUNT_ENV,
	},
	REQUEST_TYPE_ID: 113
});
