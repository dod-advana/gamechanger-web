describe('Tests multiple types of jbook searches.', () => {
	before(() => {
		cy.setup();
	});

	beforeEach(() => {
		cy.initial_jbook_visit();
	});

	it('basic search by BLI', () => {
		// Type in a BLI to search
		cy.get('#gcSearchInput').type('0206623M');

		// Get the search button and click it
		cy.get('#gcSearchButton').click();

		// Wait for the results to be visible
		cy.get('[data-cy="jbook-search-results"]', { timeout: 10000 }).should('exist');

		// Results should have more than 1
		cy.get('[data-cy="jbook-search-results"]')
			.find('[data-cy="jbook-card-header"]')
			.should('have.length.greaterThan', 1);

		// First result should have the correct name
		cy.get('[data-cy="jbook-search-results"]')
			.find('[data-cy="jbook-card-header"]')
			.first()
			.should('contain', 'BLI: 0206629M | Title: Amphibious Assault Vehicle');
	});

	it('service reviewer filter works', () => {
		// switch to AI Inventory portfolio
		cy.switch_portfolio('AI Inventory');

		// open serviceReviewer filter accordion and check "Select specific" checkbox
		cy.jbook_open_specific_filter('serviceReviewer');

		// choose Misty Blower as a filter
		const reviewer = 'Blowers, Misty (USMC US Marine Corp)';
		cy.jbook_select_specific_filter_options([reviewer]);

		// Wait for search to finish
		cy.get('[data-cy="jbook-search-load"]', { timeout: 5000 }).should('not.exist');

		// Wait for the results cards to have loaded
		cy.scrollTo('top');
		cy.get('[data-cy="jbook-card-header"]').should('exist');

		// Results should have more than 1
		cy.get('[data-cy="jbook-search-results"]')
			.find('[data-cy="jbook-card-header"]')
			.should('have.length.greaterThan', 1);

		// First result should have the correct name
		cy.get('[data-cy="jbook-search-results"]')
			.find('[data-cy="jbook-card-header"]')
			.first()
			.should('contain', 'BLI: 0206623M | Title: Fire Support System');
	});
});
