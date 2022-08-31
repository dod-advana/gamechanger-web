/* eslint-disable no-undef */
describe('Test search and filters', () => {
	beforeEach(() => {
		cy.setup();
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

	it('test out text input filters', () => {
		// type in "defense"
		cy.get('#gcSearchInput').type('defense');

		// click search button
		cy.get('#gcSearchButton').click();

		// check that filter container shows up
		cy.get('[data-cy="eda-filter-container"]', { timeout: 20000 }).should('exist');

		// find DoDAAC filter and type 'N00'
		cy.get('#issueOfficeDoDAACAccordion', { timeout: 10000 }).click();
		cy.get('#issueOfficeDoDAACFilter', { timeout: 10000 }).type('N00');

		// find Issue Office Name and type 'N'
		cy.get('#issueOfficeNameAccordion', { timeout: 10000 }).click();
		cy.get('#issueOfficeNameFilter', { timeout: 10000 }).type('N');

		// find Vendor Name and type 'Booz'
		cy.get('#vendorNameAccordion', { timeout: 10000 }).click();
		cy.get('#vendorNameFilter', { timeout: 10000 }).type('Booz');

		// find Funding Office DoDAAC and type 'N'
		cy.get('#fundingOfficeCodeAccordion', { timeout: 10000 }).click();
		cy.get('#fundingOfficeCodeFilter', { timeout: 10000 }).type('N');

		// find Funding Agency Name and type 'navy'
		cy.get('#fundingAgencyNameAccordion', { timeout: 10000 }).click();
		cy.get('#fundingAgencyNameFilter', { timeout: 10000 }).type('navy');

		cy.get('#gcSearchButton').click();

		// should have less than 1000 results
		cy.get('.eda-card-front', { timeout: 10000 }).should('exist');

		cy.get('.eda-card-front').should('have.length.lessThan', 1000);
	});

	it('test out checkbox filters', () => {
		// type in "defense"
		cy.get('#gcSearchInput').type('defense');

		// click search button
		cy.get('#gcSearchButton').click();

		// check that filter container shows up
		cy.get('[data-cy="eda-filter-container"]', { timeout: 20000 }).should('exist');

		// open issue organization and make selections
		cy.get('#issueOrganizationAccordion', { timeout: 10000 }).click();
		cy.get('#specificOrgCheckbox', { timeout: 10000 }).click();
		cy.get('#airForceCheckbox', { timeout: 10000 }).click();

		// open fiscal years and make 2 selections
		cy.get('#fiscalYearAccordion', { timeout: 10000 }).click();
		cy.get('#specificFiscalYearCheckbox', { timeout: 10000 }).click();
		cy.get('#year2021Checkbox', { timeout: 10000 }).click();
		cy.get('#year2022Checkbox', { timeout: 10000 }).click();

		// open Available EDA Format and select PDS
		cy.get('#contractDataAccordion', { timeout: 10000 }).click();
		cy.get('#specificContractDataCheckbox', { timeout: 10000 }).click();
		cy.get('#pdsCheckbox', { timeout: 10000 }).click();

		// click search button
		cy.get('#gcSearchButton').click();

		cy.get('.eda-card-front').should('have.length.greaterThan', 0);
		cy.get('.eda-card-front').should('have.length.lessThan', 100);
	});

	it('test out min and max obligated amounts filters', () => {
		// type in "defense"
		cy.get('#gcSearchInput').type('defense');

		// click search button
		cy.get('#gcSearchButton').click();

		// check that filter container shows up
		cy.get('[data-cy="eda-filter-container"]', { timeout: 20000 }).should('exist');

		// enter amount for obligated amount filters
		cy.get('#obligatedAmountAccordion', { timeout: 10000 }).click();
		cy.get('#minObligatedAmountFilter', { timeout: 10000 }).type('100000');
		cy.get('#maxObligatedAmountFilter', { timeout: 10000 }).type('500000');

		cy.get('#gcSearchButton').click();

		cy.get('.eda-card-front').should('have.length.greaterThan', 0);
		cy.get('.eda-card-front').should('have.length.lessThan', 1000);
	});
});
