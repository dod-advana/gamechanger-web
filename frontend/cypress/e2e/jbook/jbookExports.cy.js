import { deleteDownloadsFolder } from '../../support/utils';
const path = require('path');

describe('file download', () => {
	beforeEach(() => {
		cy.setup();
		cy.initial_jbook_visit();
		deleteDownloadsFolder();
	});

	it('verifies CUI CSV download', async () => {
		// Type in a small result # to search
		cy.get('#gcSearchInput').type('Shark');
		// Get the search button and click it
		cy.get('#gcSearchButton').click();
		// Wait for the results to be visible
		cy.getDataCy('jbook-search-results', { timeout: 10000 }).should('exist');
		// click export button
		cy.get('[data-cy=export-button]').click();
		cy.get('[data-cy=export-dialog]', { timeout: 10000 }).should('exist');
		cy.set_export_classification('CUI');
		cy.set_export_format('csv');
		//click generate button
		cy.get('[data-cy=generate]').click();
		// wait 10s for download
		cy.wait(10000);
		// compare old and new files in downloads
		cy.task('getFiles', 'cypress/downloads').then((newFiles) => {
			cy.wrap(newFiles.length).should('eq', 1);
			// that new file should end with CUI (chosen eariler in the test)
			cy.wrap(newFiles[0].endsWith('-CUI.csv')).should('eq', true);
		});
	});
});