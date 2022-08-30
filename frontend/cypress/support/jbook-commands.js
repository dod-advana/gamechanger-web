/* ************* GENERAL ************** */

// this visits the jbook page, clicks consent agreement, and
// then waits for initial search tocomplete
Cypress.Commands.add('initial_jbook_visit', () => {
	cy.visit_accept_consent('jbook');
	// Wait for search box to be visible
	cy.get('#gcSearchInput', { timeout: 10000 }).should('exist');
	// Wait for initial search to initiate and complete
	cy.get('[data-cy="jbook-search-load"]', { timeout: 10000 }).should('exist');
	cy.get('[data-cy="jbook-search-load"]', { timeout: 10000 }).should('not.exist');
	// Wait for the results cards to have loaded
	cy.get('[data-cy="jbook-card-header"]').should('exist');
	// Results should have >1
	cy.get('[data-cy="jbook-search-results"]')
		.find('[data-cy="jbook-card-header"]')
		.should('have.length.greaterThan', 1);
});

/* ************* SEARCH ************** */

// this switches the jbook portfolio
Cypress.Commands.add('switch_portfolio', (portfolio) => {
	cy.get('[data-cy="portfolio-select"]').should('exist');
	cy.get('[data-cy="portfolio-select"]').click();
	cy.get(`li[data-value="${portfolio}"]`).click();
});

// this opens a jbook filter and selects the "select specific" checkbox
Cypress.Commands.add('jbook_open_specific_filter', (filterName) => {
	// get the sidebar
	cy.get('[data-cy="jbook-filters"]').should('exist');
	// get the filter
	cy.get(`[data-cy="${filterName}-filter"]`).should('exist');
	// open the filter accordion
	cy.get(`[data-cy="${filterName}-filter"] #accordion-header`).click();
	// check that filter is opened
	cy.get(`[data-cy="${filterName}-filter"] #accordion-content`).should('exist');
	// select specific checkbox
	cy.get(`[data-cy="${filterName}-filter"] [data-cy="filter-checkbox"]`).click();
});

// this selects options for one of the "seelct specific" jbook filters
Cypress.Commands.add('jbook_select_specific_filter_options', (filterOptions) => {
	filterOptions.forEach((_option) => {
		cy.get(`[data-cy="filter-option-${_option}"]`).click();
	});
});

/* ************* EXPORT ************** */
Cypress.Commands.add('set_export_format', (format) => {
	// get the sidebar
	cy.get('[data-cy="export-dialog"]').should('exist');
	// get the filter
	cy.get(`[data-cy="export-select"]`).should('exist');

	cy.get(`[data-cy="export-select-form"]`).should('exist');
	cy.get(`[data-cy="export-select"]`).click();

	// open the filter accordion
	cy.get(`[data-cy="export-option-${format}"]`).click();
});

Cypress.Commands.add('set_export_classification', (format) => {
	// get the sidebar
	cy.get('[data-cy="export-dialog"]').should('exist');
	// get the filter
	cy.get(`[data-cy="export-classification"]`).should('exist');

	cy.get(`[data-cy="export-autocomplete"]`).should('exist');
	cy.get(`[data-cy="export-autocomplete"]`).click();
	cy.get('.MuiAutocomplete-popper li[data-option-index="1"]').click();
});
