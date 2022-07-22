describe('Tests multiple types of jbook searches.', () => {
	before(() => {
		cy.setup();
	});

	beforeEach(() => {
		cy.initJbookVisit();
	});

	it('Should be able to search by BLI.', () => {
		// Type in a policy name
		cy.get('#gcSearchInput').type('0206623M');

		// Get the search button and click it
		cy.get('#gcSearchButton').click();

		// Wait for the results to be visible
		cy.get('[data-cy="jbook-search-results"]', { timeout: 10000 }).should('exist');

		// Results should have more than 1
		cy.get('[data-cy="jbook-search-results"]').find('[data-cy="searchCard"]').should('have.length.greaterThan', 1);

		// First result should have the correct name
		cy.get('[data-cy="jbook-search-results"]')
			.find('[data-cy="searchCard"]')
			.first()
			.should('contain', 'BLI: 0206629M | Title: Amphibious Assault Vehicle');
	});
});
