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

	static setupHeaders = (cy, cn, userId) => {
		Cypress.on('uncaught:exception', (_err, _runnable) => {
			return false;
		});

		cy.intercept(`${Cypress.env('API_URL')}**`, (req) => {
			req.headers['x-env-ssl_client_certificate'] = cn || Cypress.env('SSL_CLIENT_CERTIFICATE');
			req.headers['SSL_CLIENT_S_DN_CN'] = userId || Cypress.env('SSL_CLIENT_S_DN_CN');
		}).as('gamechangerAPI');

		cy.server({
			onAnyRequest: (_route, proxy) => {
				proxy.xhr.setRequestHeader('x-env-ssl_client_certificate', cn || Cypress.env('SSL_CLIENT_CERTIFICATE'));
				proxy.xhr.setRequestHeader('SSL_CLIENT_S_DN_CN', userId || Cypress.env('SSL_CLIENT_S_DN_CN'));
			},
		});

		cy.intercept(`${Cypress.env('API_URL')}/api/gamechanger/thumbnailDownload`, (req) => {
			req.reply({ statusCode: 200, body: 'thumbnail' });
		});
	};
}

export default CypressHelper;
