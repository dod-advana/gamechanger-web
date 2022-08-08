/* ************* GENERAL ************** */
Cypress.Commands.add('login', (clone) => {
    cy.setup();
    cy.visit_accept_consent(clone);
});

Cypress.Commands.add('search', (searchTerm) => {
    cy.get('#gcSearchInput', { timeout: 10000 }).type(`${searchTerm}`);
    cy.get('#gcSearchButton').click();
    cy.getDataCy('searchCard', { timeout: 60000 }).should('exist');
});

Cypress.Commands.add('setSourceFilter', (filterName) => {
    cy.getDataCy('source-accordion', {timeout: 100000}).click();
    cy.get('span').contains(filterName).click();
});

Cypress.Commands.add('setTypeFilter', (filterName) => {
    cy.getDataCy('type-accordion', {timeout: 100000}).click();
    cy.get('span').contains(filterName).click();
});