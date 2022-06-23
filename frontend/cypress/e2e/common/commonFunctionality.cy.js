const UNAUTHORIZED_ROUTE = '/#/unauthorized';

describe('Tests the common functionality of the app including authorization and consent banner.', () => {
	before(() => {
		// Clear cookies
		cy.clearCookies();
	});

	// Test the consent banner appears and a cookie is created when okay clicked
	it('The consent banner should be there.', () => {
		// Visit the main page
		cy.visit(Cypress.env('BASE_URL'));

		// Check the consent banner is there
		cy.get('#consent-agreement').should('exist');

		// Click the okay button
		cy.get('#consent-agreement-okay').click();

		// Get the consent cookie
		cy.getCookie('data.mil-consent-agreed').should('exist');

		// Now navigate back to main page
		cy.visit(Cypress.env('BASE_URL'));

		// Check the consent banner is not there
		cy.get('#consent-agreement').should('not.exist');
	});

	it('Unauthorized should appear as the user is not authorized.', () => {
		// Visit the main page
		cy.visit(Cypress.env('BASE_URL') + '/#/gamechanger-admin');

		cy.location('pathname').should('include', UNAUTHORIZED_ROUTE);
	});
});
