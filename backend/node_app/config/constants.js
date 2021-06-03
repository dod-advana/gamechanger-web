var path = require('path');
const dataCatalogConfig = require('./datacatalog');

module.exports = Object.freeze({
	VERSION: '#DYNAMIC_VERSION',
	APPROVED_API_CALLERS: process.env.APPROVED_API_CALLERS ? process.env.APPROVED_API_CALLERS.split(' ') : [],
	TLS_CERT_FILEPATH: process.env.TLS_CERT_FILEPATH,
	TLS_CERT_CA_FILEPATH: process.env.TLS_CERT_CA_FILEPATH,
	TLS_KEY_FILEPATH: process.env.TLS_KEY_FILEPATH,
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
				password: process.env.POSTHGRES_PASSWORD_GC_ORCHESTRATION,
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
		hostName: '10.194.9.121',
		port: 8983,
		protocol: 'http',
		downloadLimit: 5000,
		s3Dest: 'advana-raw-zone',
		s3Path: '/gamechanger/json',
		index: 'gamechanger',
		emailAddress: '607749@bah.com',
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
		host: '10.224.0.248',
		port: 25,
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
		ca: process.env.GAMECHANGER_ELASTICSEARCH_CA_FILEPATH,
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
		ca: process.env.EDA_ELASTICSEARCH_CA_FILEPATH,
		index: process.env.EDA_ELASTICSEARCH_INDEX,
		extSearchFields:['*_eda_ext'],//['acomod_eda_ext','product_or_service_line_item_eda_ext'],
		extRetrieveFields:['*_eda_ext'],
		// index: 'eda'
		requestTimeout: 60000
	},

	S3_REGION: process.env.S3_REGION ? process.env.S3_REGION : undefined,
	GRAPH_DB_CONFIG: {
		url: 'neo4j://10.194.9.69:7687',
		user: 'neo4j',
		password:  process.env.NEO4J_PASSWORD
	},
	MATOMO_DB_CONFIG: {
		host: '10.194.9.69',
		user: 'root',
		password: process.env.MYSQL_PASSWORD_MATOMO,
		database: 'matomo'
	},
	HERMES_ELASTIC_SEARCH_OPTS: {
		index: 'hermes_test_1',
		auxSearchFields: [''],
		auxRetrieveFields: ['']
	},
	QLIK_OPTS: {
		QLIK_URL: 'https://10.194.9.96:4242',
		QLIK_WS_URL: 'wss://EC2AMAZ-53VQBQF.drced.local:4747',
		CA: process.env.QLIK_CERT_CA,
		KEY:  process.env.QLIK_CERT_KEY,
		CERT:  process.env.QLIK_CERT_CERT,
		QLIK_SYS_ACCOUNT: 'Administrator',
		AD_DOMAIN: 'ec2amaz-53vqbqf'
	},
	DATA_CATALOG_OPTS: {
		port: 8443,
		protocol: 'http',
		host: '10.194.9.123',
		core_rest_path: '/rest/2.0',
		username: 'HSong',
		password: process.env.DATA_CATALOG_PASSWORD,
		api_config: dataCatalogConfig,
		ca: '/etc/pki/CA/certs/rootca.pem'
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
		USERNAME: 'webapp-serviceaccount',
		PASSWORD: 'super secret password',
		EMAIL: 'advana_service_account@mail.mil',
		PHONE: '202-555-0134',
		ORGANIZATION: 'OSD',
		ENVIRONMENT: 'NIPR',
	},
	REQUEST_TYPE_ID: 113,
	MATOMO_OPTS: {
		USERNAME: 'admin',
		PASSWORD: 'BoozAllen321#@!'
	}
});
