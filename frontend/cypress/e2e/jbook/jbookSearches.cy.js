describe('Tests multiple types of jbook searches.', () => {
	beforeEach(() => {
		cy.setup();
		cy.initial_jbook_visit();
	});

	it('basic search by PE', () => {
		// Type in a PE to search
		cy.get('#gcSearchInput').type('0206623M');

		// Get the search button and click it
		cy.get('#gcSearchButton').click();

		// Wait for the results to be visible
		cy.getDataCy('jbook-search-results', { timeout: 10000 }).should('exist');

		// Results should have more than 1
		cy.getDataCy('jbook-search-results').find('[data-cy="jbook-card-header"]').should('have.length.greaterThan', 1);

		// First result should have the correct name
		cy.getDataCy('jbook-search-results')
			.find('[data-cy="jbook-card-header"]')
			.first()
			.should('contain', 'PE: 0206623M - MC Ground Cmbt Spt Arms Sys');
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
		cy.getDataCy('jbook-search-load', { timeout: 5000 }).should('not.exist');

		// Wait for the results cards to have loaded
		cy.scrollTo('top');
		cy.getDataCy('jbook-card-header').should('exist');

		// Results should have more than 1
		cy.getDataCy('jbook-search-results').find('[data-cy="jbook-card-header"]').should('have.length.greaterThan', 1);

		// First result should have the correct name
		cy.getDataCy('jbook-search-results')
			.find('[data-cy="jbook-card-header"]')
			.first()
			.should('contain', 'BLI: 846070 | Title: DARP RC135');
	});
});

describe('Tests search from multiple pages.', () => {
	before(() => {
		cy.setup();
	});

	it('can search from profile page', () => {
		// load particular document's profile page
		cy.visit_accept_consent(
			'jbook/profile?type=Procurement&id=pdoc#2019#PB#05#A01000#57#N/A#3010&appropriationNumber=3010&portfolioName=General&budgetYear=2019'
		);

		// look for name of document in profile page title
		cy.getDataCy('jbook-profile-title', { timeout: 15000 }).should('contain', 'A01000: A-10  Air Force (AF) ');

		// Type in a PE to search
		cy.get('#gcSearchInput').type('0206623M');

		// Get the search button and click it
		cy.get('#gcSearchButton').click();

		// Wait for the results to be visible
		cy.getDataCy('jbook-search-results', { timeout: 10000 }).should('exist');

		// Results should have more than 1
		cy.getDataCy('jbook-search-results')
			.find('[data-cy="jbook-card-header"]', { timeout: 20000 })
			.should('have.length.greaterThan', 1);

		// First result should have the correct name
		cy.getDataCy('jbook-search-results')
			.find('[data-cy="jbook-card-header"]')
			.first()
			.should('contain', 'PE: 0206623M - MC Ground Cmbt Spt Arms Sys');
	});
});

describe.only('does changing to test/hypersonic cause random scrolling', () => {
	before(() => {
		cy.setup();
	});

	it('can successfully not cause window to jump in test portfolio', () => {
		// load particular document's profile page
		cy.visit_accept_consent(
			'jbook/profile?type=Procurement&id=pdoc#2019#PB#05#A01000#57#N/A#3010&appropriationNumber=3010&portfolioName=Test%20Portfolio&budgetYear=2019'
		);

		// Wait some time
		cy.wait(3000);

		// Scroll down
		cy.scrollTo(0, 835.5);

		//Open the dropdown menu in reviewer form and select the first option
		cy.getDataCy('jbook-reviewer-label').type('{downArrow}').type('{enter}');

		// Check to see if the window has jumped at all
		cy.window().then(($window) => {
			expect($window.scrollY).to.be.closeTo(835.5, 0);
		});
	});
	it('can successfully not cause window to jump in hypersonics', () => {
		// load particular document's profile page
		cy.visit_accept_consent(
			'jbook/profile?type=RDT%26E&searchText=0909999D8Z&id=rdoc#2023#PB#03#0909999D8Z#97#OFFICE%20OF%20THE%20SECRETARY%20OF%20DEFENSE#0400#000&appropriationNumber=0400&portfolioName=Hypersonics&budgetYear=2023'
		);

		// Wait some time
		cy.wait(3000);

		// Scroll down
		cy.scrollTo(0, 1052.5);

		//Open the dropdown menu in reviewer form and select the first option
		cy.getDataCy('jbook-reviewer-label').type('{downArrow}').type('{enter}');

		// Check to see if the window has jumped at all
		cy.window().then(($window) => {
			expect($window.scrollY).to.be.closeTo(1052.5, 0);
		});
	});
});
