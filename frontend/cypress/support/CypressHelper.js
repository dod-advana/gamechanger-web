const CN = Cypress.env('CYPRESS_SSL_CLIENT_CERTIFICATE') || Cypress.env('SSL_CLIENT_CERTIFICATE');
const USER_ID = Cypress.env('CYPRESS_SSL_CLIENT_S_DN_CN') || Cypress.env('SSL_CLIENT_S_DN_CN');

export const API_URL = Cypress.env('CYPRESS_API_URL') || Cypress.env('API_URL');
const WAIT_TIMES = 5;

class CypressHelper {
	constructor(cy) {
		this.cy = cy;
		this.failedTests = [];

		// Catch all failures and send to slack
		Cypress.on('fail', (error, _test) => {
			console.log(error);

			throw error; // throw error to have test still fail
		});
	}

	static setConsentCookie(cy) {
		const futureDate = new Date();
		futureDate.setUTCDate(futureDate.getUTCDate() + 2);
		cy.setCookie('data.mil-consent-agreed', new Date().toString(), {
			domain: BASE_URL,
		});
	}

	static setupHeaders = (cy, cn, userId) => {
		Cypress.on('uncaught:exception', (_err, _runnable) => {
			return false;
		});

		cy.intercept(`${API_URL}**`, (req) => {
			req.headers['x-env-ssl-client-certificate'] = cn || CN;
			req.headers['SSL-CLIENT-S-DN-CN'] = userId || USER_ID;
		}).as('gamechangerAPI');

		cy.server({
			onAnyRequest: (_route, proxy) => {
				proxy.xhr.setRequestHeader('x-env-ssl-client-certificate', cn || CN);
				proxy.xhr.setRequestHeader('SSL-CLIENT-S-DN-CN', userId || USER_ID);
			},
		});

		cy.intercept(`${API_URL}/api/gamechanger/thumbnailDownload`, (req) => {
			req.reply({ statusCode: 200, body: 'thumbnail' });
		});
	};
}

export default CypressHelper;
