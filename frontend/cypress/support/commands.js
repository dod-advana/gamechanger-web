/// <reference types="cypress" />
// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
//
// declare global {
//   namespace Cypress {
//     interface Chainable {
//       login(email: string, password: string): Chainable<void>
//       drag(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       dismiss(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       visit(originalFn: CommandOriginalFn, url: string, options: Partial<VisitOptions>): Chainable<Element>
//     }
//   }
// }
import '@testing-library/cypress/add-commands';
import CypressHelper, { BASE_URL } from './CypressHelper';

// this handles setting up your cookies and headers
Cypress.Commands.add('setup', () => {
	CypressHelper.setupHeaders(cy);
	// Clear cookies
	cy.clearCookies();
});

// this visits a page and clicks the consent agreement
Cypress.Commands.add('visitPage', (page) => {
	// Visit the main page
	cy.visit(`${BASE_URL}/#/${page}`);

	// Click the okay button
	cy.get('[data-cy="consent-agreement-okay"]', { timeout: 10000 }).click();
});

//jbook commands

// this visits the jbook page, clicks consent agreement, and
// then waits for initial search tocomplete
Cypress.Commands.add('initJbookVisit', () => {
	cy.visitPage('jbook');

	// Wait for search box to be visible
	cy.get('#gcSearchInput', { timeout: 10000 }).should('exist');
	// Wait for initial search to be done
	cy.get('[data-cy="jbook-search-load"]', { timeout: 10000 }).should('not.exist');
	// Wait for the results to be visible
	cy.get('[data-cy="jbook-search-results"]', { timeout: 10000 }).should('exist');
	// Results should have >1
	cy.get('[data-cy="jbook-search-results"]').find('[data-cy="searchCard"]').should('have.length.greaterThan', 1);
});
