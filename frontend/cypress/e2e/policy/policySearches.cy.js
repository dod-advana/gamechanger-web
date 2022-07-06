import CypressHelper, { BASE_URL } from '../../support/CypressHelper';

describe('Tests multiple types of policy searches.', () => {
	it('Should be able to search for a policy by name.', () => {
		CypressHelper.setupHeaders(cy);
		// Clear cookies
		cy.clearCookies();

		// Visit the main page
		cy.visit(`${BASE_URL}/#/gamechanger`);

		// Click the okay button
		cy.get('[data-cy="consent-agreement-okay"]').click();

		// Wait for search box to be visible
		cy.get('#gcSearchInput', { timeout: 10000 }).should('exist');

		// Type in a policy name
		cy.get('#gcSearchInput').type('AFI 16-1301');

		// Get the search button and click it
		cy.get('#gcSearchButton').click();

		// Wait for the results to be visible
		cy.get('[data-cy="results-Documents"]', { timeout: 10000 }).should('exist');

		// Results should have more than 1
		cy.get('[data-cy="results-Documents"]').find('[data-cy="searchCard"]').should('have.length.greaterThan', 1);

		// First result should have the correct name
		cy.get('[data-cy="results-Documents"]')
			.find('[data-cy="searchCard"]')
			.first()
			.should('contain', 'AFI 16-1301 SURVIVAL EVASION RESISTANCE AND ESCAPE (SERE) PROGRAM');
	});
});
