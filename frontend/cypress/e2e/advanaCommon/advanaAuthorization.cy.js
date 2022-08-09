import CypressHelper, { BASE_URL } from '../../support/CypressHelper';

describe('Tests the authorization api', () => {
	it('Should be unauthorized to view the gamechanger admin page', () => {
		// Setting headers to a fake person
		CypressHelper.setupHeaders(cy, 'not.a.person.1234567890', '1234567890@mil');

		// Visit the main page
		cy.visit(`${BASE_URL}/#/gamechanger-admin`);

		// Check the page is not unauthorized
		cy.get('[data-cy="unauthorized-page"]', { timeout: 10000 }).should('exist');
	});

	it('Should be authorized to view the gamechanger admin page', () => {
		// Set headers to good headers
		CypressHelper.setupHeaders(cy);

		// Visit the main page
		cy.visit(`${BASE_URL}/#/gamechanger-admin`);

		// Check the page is unauthorized
		cy.get('[data-cy="unauthorized-page"]', { timeout: 10000 }).should('not.exist');
	});

	it('Should try to authorize 5 times and fail and show unauthorized screen', () => {
		cy.visit(`${BASE_URL}/#/search`);

		// Check the page is not unauthorized
		cy.get('[data-cy="unauthorized-page"]', { timeout: 50000 }).should('exist');
	});

	it('Should try to visit a clone after being unauthorized and with proper headers pass', () => {
		// Set headers to good headers
		CypressHelper.setupHeaders(cy);

		cy.visit(`${BASE_URL}/#/search`);

		// Check the page is unauthorized
		cy.get('[data-cy="unauthorized-page"]', { timeout: 10000 }).should('not.exist');
	});
});
