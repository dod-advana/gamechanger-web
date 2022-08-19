/**
 * Policy Commands
 */
Cypress.Commands.add('login', (clone) => {
	cy.setup();
	cy.visit_accept_consent(clone);
});

Cypress.Commands.add('search', (searchTerm) => {
	cy.get('#gcSearchInput', { timeout: 10000 }).type(`${searchTerm}`);
	cy.get('#gcSearchButton').click();
	cy.getDataCy('searchCard', { timeout: 60000 })
		.eq(0)
		.should('exist')
		.find('.spinner', { timeout: 60000 })
		.should('not.exist');
});

Cypress.Commands.add('setSourceFilter', (filterName) => {
	cy.getDataCy('source-accordion', { timeout: 100000 }).click();
	cy.get('span').contains(filterName).click();
});

Cypress.Commands.add('setTypeFilter', (filterName) => {
	cy.getDataCy('type-accordion', { timeout: 100000 }).click();
	cy.get('span').contains(filterName).click();
});

/**
 * Gets the top level of the card container at a given index (0 based).
 */
Cypress.Commands.add('getCard', (cardIndex, ...args) => {
	cy.get('.styled-card-container', ...args).eq(cardIndex);
});

Cypress.Commands.add('getFavoriteCard', (favoriteTitle, ...args) => {
	cy.getDataCy('favorite-card', ...args)
		.find('.summary-title')
		.contains(favoriteTitle);
});

/**
 * Clicks the Tab on the Search bar
 */
Cypress.Commands.add('switchTab', (resultType) => {
	cy.getDataCy('tabs-container', { timeout: 10000 }).find('p').contains(resultType).should('exist').click();
});
