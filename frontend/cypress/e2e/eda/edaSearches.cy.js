/* eslint-disable no-undef */
describe('empty spec', () => {
	before(() => {
		cy.setup();
	});

	beforeEach(() => {
		cy.initial_eda_visit();
	});

	it('basic search', () => {
		// Type in some text to search
		cy.get('#gcSearchInput').type('army');

		// click search button
		cy.get('#gcSearchButton').click();

		// check that filters, results found, buttons are all showing
		cy.get('[data-cy="eda-filter-container"]', { timeout: 15000 }).should('exist');

		// results found text
		cy.get('[data-cy="eda-results-found"]', { timeout: 10000 }).should('exist');

		// view selector
		cy.get('.view-buttons-container', { timeout: 10000 }).should('exist');

		// result card
		cy.get('.eda-card-front', { timeout: 10000 }).should('exist');

		cy.get('.eda-card-front').should('have.length.greaterThan', 1);
	});
});
