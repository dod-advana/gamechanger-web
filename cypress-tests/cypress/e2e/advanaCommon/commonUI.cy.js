import CypressHelper from '../../support/CypressHelper';

describe('Tests the advanaCommon functionality of the app including side nav and consent banner.', () => {
	const cypressHelper = new CypressHelper(cy);

	beforeEach(() => {
		// Setup headers
		cypressHelper.setupHeaders();

		// Clear cookies
		cy.clearCookies();

		// Visit the main page
		cy.visit(Cypress.env('BASE_URL'));

		// Click the okay button
		cy.get('[data-cy="consent-agreement-okay"]').click();
	});

	// Test the consent banner appears and a cookie is created when okay clicked
	it('The consent banner should be there.', () => {
		// Clear cookies just for this one to test consent banner
		cy.clearCookies();

		// Visit the main page
		cy.visit(Cypress.env('BASE_URL'));

		// Check the consent banner is there
		cy.get('[data-cy="consent-agreement"]').should('exist');
	});

	it('The consent banner should be gone with a cookie showing agreement.', () => {
		// Get the consent cookie
		cy.getCookie('data.mil-consent-agreed').should('exist');

		// Check the consent banner is not there
		cy.get('[data-cy="consent-agreement"]').should('not.exist');
	});

	// Tests the basic side navigation functionality
	it('The side nav should be there.', () => {
		cy.get('[data-cy="blah"]').should('exist');
	});

	// Tests the advana pills functionality
	it('The advana pills should be there.', () => {
		cy.get('[data-cy="blah2"]').should('exist');
	});
});
