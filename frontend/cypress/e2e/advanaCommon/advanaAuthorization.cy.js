import CypressHelper, { BASE_URL } from '../../support/CypressHelper';

describe('Tests the authorization api', () => {
	it('Should be unauthorized to view the gamechanger admin page', () => {
		// Setting headers to a fake person
		CypressHelper.setupHeaders(cy, 'not.a.person.1234567890', '1234567890@mil');

		// Visit the main page
		cy.visit(`/#/gamechanger-admin`);

		// Check the page is not unauthorized
		cy.getDataCy('unauthorized-page').should('exist');
	});

	it('Should be authorized to view the gamechanger admin page', () => {
		// Set headers to good headers
		CypressHelper.setupHeaders(cy);

		// Visit the main page
		cy.visit(`/#/gamechanger-admin`);

		// Check the page is unauthorized
		cy.getDataCy('unauthorized-page').should('not.exist');
	});
});
