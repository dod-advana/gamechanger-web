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

// jbook commands
import './jbook-commands';
// policy commands
import './policy-commands';

/* ************* GENERAL ************** */

Cypress.Commands.add('getDataCy', (cyTag, ...args) => {
    cy.get(`[data-cy="${cyTag}"]`, ...args)
});

Cypress.Commands.add('findDataCy', {prevSubject: true}, (subject, cyTag) => {
    cy.wrap(subject).find(`[data-cy="${cyTag}"]`)
});

// this handles setting up your cookies and headers
Cypress.Commands.add('setup', () => {
	CypressHelper.setupHeaders(cy);
	// Clear cookies
	cy.clearCookies();
});

// this visits a page and clicks the consent agreement
Cypress.Commands.add('visit_accept_consent', (page) => {
	// Visit the main page
	cy.visit(`${BASE_URL}/#/${page}`);

	// Click the okay button
	cy.accept_consent();
});

Cypress.Commands.add('accept_consent', () => {
    cy.get('[data-cy="consent-agreement-okay"]', { timeout: 10000 }).click();
});
