/**
 * Policy Commands
 */
Cypress.Commands.add('login', (clone) => {
	cy.setup();
	cy.visit_accept_consent(clone);
});

Cypress.Commands.add('search', (searchTerm) => {
	cy.intercept('/api/gamechanger/modular/search').as('search');
	cy.get('#gcSearchInput', { timeout: 10000 }).type(`${searchTerm}`);
	cy.get('#gcSearchButton').click();
	cy.wait('@search', { timeout: 60000 });
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
Cypress.Commands.add('switchResultsTab', (resultType) => {
	cy.getDataCy('tabs-container', { timeout: 10000 }).find('p').contains(resultType).should('exist').click();
});

/**
 * Clicks the Tab from within Data Status Tracker
 */
Cypress.Commands.add('switchDstTab', (dstTabDataCyTag) => {
	cy.getDataCy(dstTabDataCyTag, { timeout: 15000 }).should('exist').click();
	cy.get('.-loading.-active', { timeout: 30000 }).should('not.exist');
});

/**
 * Types in the filter box on the DST Columns at the given column index
 */
Cypress.Commands.add('typeIntoDstFilter', (colIndex, textToFilter) => {
	cy.get('.rt-tr>div').find('input').eq(colIndex).scrollIntoView().type(textToFilter);
	//cy.get('.-loading.-active', { timeout: 30000 }).should('not.exist');
});

Cypress.Commands.add('setupDSTIntercepts', () => {
	cy.intercept('POST', '/api/gamechanger/getCrawlerMetadata').as('getCrawlerMetadata');
	cy.intercept('POST', '/api/gamechanger/dataTracker/getTrackedData').as('getTrackedData');
});

Cypress.Commands.add('waitForProgressTableToLoad', () => {
	cy.wait('@getCrawlerMetadata', { timeout: 15000 });
});

Cypress.Commands.add('waitForDocumentsTableToLoad', () => {
	cy.wait('@getTrackedData', { timeout: 15000 });
});
