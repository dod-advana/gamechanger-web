/* eslint-disable no-undef */
/* ************* GENERAL ************** */

// visit the eda page, click consent agreement, checks for landing page
Cypress.Commands.add('initial_eda_visit', () => {
	cy.visit_accept_consent('contract');

	// wait for search box to be visible
	cy.get('#gcSearchInput', { timeout: 10000 }).should('exist');

	// wait for the search bar and recent searches to show
	cy.get('[data-cy="eda-recent-searches"]', { timeout: 10000 }).should('exist');

	// check for advanced search button
	cy.get('[data-cy="eda-advanced-settings"]', { timeout: 10000 }).should('exist');
});
