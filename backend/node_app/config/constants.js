var path = require('path');
const dataCatalogConfig = require('./datacatalog');
const fs = require('fs');

/**
 * Get cert/key provided env vars
 * @param {string} certEnvVar env var containing entire cert/key
 * @param {string} certFileEnvVar env var containing path to cert/key
 * @returns {string} cert/key contents
 */
const getCert = (certEnvVar, certFileEnvVar) => {
	if (process.env[certEnvVar]) {
		return process.env[certEnvVar].replace(/\\n/g, '\n')
	} else if (process.env[certFileEnvVar]) {
		return fs.readFileSync(process.env[certFileEnvVar], 'ascii');
	} else {
		return '';
	}
};

module.exports = Object.freeze({
	VERSION: '#DYNAMIC_VERSION',
	APPROVED_API_CALLERS: process.env.APPROVED_API_CALLERS ? process.env.APPROVED_API_CALLERS.split(' ') : [],
	TLS_CERT: getCert('TLS_CERT', 'TLS_CERT_FILEPATH'),
	TLS_CERT_CA: getCert('TLS_CERT_CA', 'TLS_CERT_CA_FILEPATH'),
	TLS_KEY: getCert('TLS_KEY', 'TLS_KEY_FILEPATH'),
	EXPRESS_TRUST_PROXY: function () {
		const str_var = process.env.EXPRESS_TRUST_PROXY ? process.env.EXPRESS_TRUST_PROXY.trim() : ''
		if (['true','false'].includes(str_var.toLowerCase())) {
			return str_var.toLowerCase() === 'true'
		}
		return str_var
	}(),
	POSTGRES_CONFIG: {
		databases: {
			game_changer: {
				username: process.env.POSTGRES_USER_GAME_CHANGER,
				password: process.env.POSTGRES_PASSWORD_GAME_CHANGER,
				database: process.env.POSTGRES_DB_GAME_CHANGER?.trim() || 'game_changer',
				data_api_database: process.env.PG_DST_DB?.trim() || 'data_api',
				host: process.env.POSTGRES_HOST_GAME_CHANGER,
				port: 5432,
				dialect: 'postgres',
				logging: false
			},
			'gc-orchestration': {
				username: process.env.POSTGRES_USER_GC_ORCHESTRATION,
				password: process.env.POSTGRES_PASSWORD_GC_ORCHESTRATION,
				database: process.env.POSTGRES_DB_GC_ORCHESTRATION?.trim() || 'gc-orchestration',
				host: process.env.POSTGRES_HOST_GC_ORCHESTRATION,
				port: 5432,
				dialect: 'postgres',
				logging: false
			},
			uot: {
				username: process.env.POSTGRES_USER_UOT,
				password: process.env.POSTGRES_PASSWORD_UOT,
				database: process.env.PG_UM_DB?.trim() || 'uot',
				host: process.env.POSTGRES_HOST_UOT,
				port: 5432,
				dialect: 'postgres',
				logging: false
			},
			eda: {
				username: process.env.POSTGRES_USER_EDA,
				password: process.env.POSTGRES_PASSWORD_EDA,
				database: process.env.POSTGRES_DB_EDA?.trim() || 'eda',
				host: process.env.POSTGRES_HOST_EDA,
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
		isDemoDeployment: (process.env.GAMECHANGER_DEMO_DEPLOYMENT?.trim() || 'false') === 'true',
		demoUser: process.env.GAMECHANGER_DEMO_USER?.trim() || "007",
		disableStatsAPI: (process.env.GAMECHANGER_DISABLE_STATS_API?.trim() || 'false') === "true",
		isDecoupled: process.env.REACT_APP_GC_DECOUPLED === 'true',
		version: 'game_changer',
		impalaTable: 'policy_analytics.gc_history',
		protocol: 'http',
		downloadLimit: 5000,
		index: 'gamechanger',
		emailAddress: process.env.EMAIL_ADDRESS,
		cacheReloadUserId: 'gc-auto-cache-reload',
		cacheReloadCronTimingPattern: '0 0 * * *',
		allow_daterange: true,
		historyIndex: process.env.GAMECHANGER_ELASTICSEARCH_HISTORY_INDEX,
		entityIndex: process.env.GAMECHANGER_ELASTICSEARCH_ENTITIES_INDEX,
		textSuggestIndex: process.env.GAMECHANGER_ELASTICSEARCH_SUGGEST_INDEX,
		favoriteSearchPollInterval: process.env.GAMECHANGER_FAVORITE_SEARCH_POLL_INTERVAL
	},
	GAMECHANGER_ML_API_BASE_URL: `http://${process.env.GAMECHANGER_ML_API_HOST}:5000`,
	ADVANA_EMAIL_CONTACT_NAME: 'Advana Do Not Reply',
	ADVANA_NOREPLY_EMAIL_ADDRESS: 'no-reply@boozallencsn.com',
	ADVANA_EMAIL_TRANSPORT_OPTIONS: {
		sendmail: true,
		newline: 'unix',
		secure: true
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
		legislation_index: process.env.GAMECHANGER_LEGISLATION ? process.env.GAMECHANGER_LEGISLATION : 'gamechanger_legislation',
		assist_index: process.env.GAMECHANGER_ASSIST ? process.env.GAMECHANGER_ASSIST : 'gamechanger_assist',
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
	BUDGETSEARCH_ELASTIC_SEARCH_OPTS: {
		index: process.env.BUDGETSEARCH_ELASTICSEARCH_INDEX
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
	CDO_ELASTIC_SEARCH_OPTS: {
		index: process.env.CDO_ELASTICSEARCH_INDEX,
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
	REQUEST_TYPE_ID: 113,
	JIRA_CONFIG:{
		username: process.env.JIRA_USERNAME,
		password: process.env.JIRA_PASSWORD,
		domain: process.env.JIRA_DOMAIN,
		project_key: process.env.JIRA_PROJECT_KEY,
		rating_id: process.env.JIRA_RATING_ID,
		advana_product: process.env.JIRA_ADVANA_PRODUCT,
		feedbackType: process.env.JIRA_FEEDBACK_TYPE
	},
	GRAPH_CONFIG: {
		PULL_NODES_FROM_NEO4J_MAX_LIMIT: process.env.PULL_NODES_FROM_NEO4J_MAX_LIMIT,
		GRAPH_VIEW_NODES_DISPLAYED_WARNING_LIMIT: process.env.GRAPH_VIEW_NODES_DISPLAYED_WARNING_LIMIT,
		MAX_GRAPH_VIEW_NODES_DISPLAYED: process.env.MAX_GRAPH_VIEW_NODES_DISPLAYED,
	},
});
