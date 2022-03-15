export default {
	DASHBOARD_DEFAULT_SYSTEM: 'GFEBS',
	API_URL: window?.__env__?.REACT_APP_BACKEND_URL
		? window?.__env__?.REACT_APP_BACKEND_URL
		: process.env.REACT_APP_BACKEND_URL,
	GLUU_SSO_ENABLED:
		window?.__env__?.REACT_APP_GLUU_SSO !== 'disabled' &&
		process.env.REACT_APP_GLUU_SSO !== 'disabled',
	TLD: 'mil',
	QLIK_URL: 'https://qlik.audit.boozallencsn.com',
	GAMECHANGER_DECOUPLED_URL: 'https://gamechanger.advana.data.mil',
	STREAMSETS_URL: 'https://streamsets',
	CLASSIFICATION_BANNER_TEXT: 'DEVELOPMENT',
	CLASSIFICATION_BANNER_COLOR: 'green',
	HELP_DESK_LINK: 'https://support.advana.data.mil',
	TRIFACTA_LINK: 'https://trifacta.advana.data.mil',
	CONFLUENCE_LINK: 'https://wiki.advana.data.mil',
	NFR_LINK: 'https://nfr.advana.data.mil',
	DATA_CATALOG_LINK: window?.__env__?.REACT_APP_DATA_CATALOG_LINK
		? window?.__env__?.REACT_APP_DATA_CATALOG_LINK
		: process.env.REACT_APP_DATA_CATALOG_LINK,
	MATOMO_LINK: window?.__env__?.REACT_APP_MATOMO_LINK
		? window?.__env__?.REACT_APP_MATOMO_LINK
		: process.env.REACT_APP_MATOMO_LINK,
	MAX_SIMPLE_TABLE_CELLS: 50000,
	PERMISSIONS: {
		GAMECHANGER_ADMIN: 'Gamechanger Admin',
		SUPER_ADMIN: 'Webapp Super Admin',
		UNSUPER_ADMIN: 'Tier 3 Support',
	},
	GAMECHANGER: {
		SHOW_ASSIST: true,
		USE_NEO4J: true,
		SEARCH_VERSION: 1,
		SHOW_TOPICS: true,
		SHOW_DATERANGES: true,
		SHOW_SOURCE_TRACKER: false,
	},
	USER_TOKEN_ENDPOINT: `${
		window?.__env__?.REACT_APP_BACKEND_URL
			? window?.__env__?.REACT_APP_BACKEND_URL
			: process.env.REACT_APP_BACKEND_URL
	}/api/auth/token`,
	JEXNET_LINK: window?.__env__?.REACT_APP_JEXNET_LINK 
		? window?.__env__?.REACT_APP_JEXNET_LINK
		: process.env.REACT_APP_JEXNET_LINK 
};
