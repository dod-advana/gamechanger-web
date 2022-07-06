import CypressHelper, { BASE_URL } from '../../support/CypressHelper';

describe('Tests the advanaCommon functionality of the app including side nav and consent banner.', () => {
	// Test the consent banner appears and a cookie is created when okay clicked
	it('The consent banner should be there.', () => {
		CypressHelper.setupHeaders(cy);

		// Clear cookies just for this one to test consent banner
		cy.clearCookies();

		// Visit the main page
		cy.visit(`${BASE_URL}/#/gamechanger`);

		// Check the consent banner is there
		cy.get('[data-cy="consent-agreement"]', { timeout: 10000 }).should('exist');
	});

	it('The consent banner should be gone with a cookie showing agreement.', () => {
		CypressHelper.setupHeaders(cy);

		// Clear cookies
		cy.clearCookies();

		// Visit the main page
		cy.visit(`${BASE_URL}/#/gamechanger`);

		// Click the okay button
		cy.get('[data-cy="consent-agreement-okay"]', { timeout: 10000 }).click();

		// Get the consent cookie
		cy.getCookie('data.mil-consent-agreed').should('exist');

		// Check the consent banner is not there
		cy.get('[data-cy="consent-agreement"]').should('not.exist');
	});
});
