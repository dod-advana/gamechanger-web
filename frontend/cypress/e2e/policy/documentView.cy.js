/// <reference types="Cypress" />

describe('Tests various functionalities on the Document Details page.', () => {
	beforeEach(() => {
		cy.setup();
		cy.visit_accept_consent(
			'gamechanger-details?cloneName=gamechanger&type=document&documentName=DoDI%203000.04%20CH%202.pdf_0'
		);
	});

	it('Document Details page is accessible via URL', () => {
		cy.getDataCy('details-type', { timeout: 10000 }).should('contain', 'Document');
	});

	it('Document title matches the one in the URL', () => {
		cy.get('.name', { timeout: 10000 }).should('contain', 'DoDI 3000.04 DoD Munitions Requirements Process (MRP)');
	});

	it('Detects presence and naming of all accordion bars', () => {
		cy.get('.section:nth-child(1)>div', { timeout: 10000 }).should('contain', 'GRAPH VIEW');
		cy.get('.section:nth-child(2)>div', { timeout: 10000 }).should('contain', 'SIMILAR DOCUMENTS');
		cy.get('.section:nth-child(3)>div', { timeout: 10000 }).should('contain', 'DOCUMENTS REFERENCED');
		cy.get('.section:nth-child(4)>div', { timeout: 10000 }).should('contain', 'DOCUMENTS REFERENCED BY');
	});

	// Similar documents accordion
	it('Expands SIMILAR DOCUMENTS accordion and tests integrity of contents', () => {
		// expand accordion
		cy.get('.MuiAccordionSummary-expandIcon', { timeout: 10000 }).eq(1).click();
		// check that details are visible
		cy.get('.MuiAccordionDetails-root').eq(1).should('be.visible');
		// check that there are at least 11 results (loading)
		cy.get('.MuiAccordionDetails-root', { timeout: 10000 })
			.eq(1)
			.get('.row', { timeout: 10000 })
			.first()
			.find('[data-cy="searchCard"]', { timeout: 10000 })
			.should('have.lengthOf', 11);
	});

	// Referenced documents accordion
	it('Expands DOCUMENTS REFERENCED accordion and tests integrity of contents', () => {
		// expand accordion
		cy.get('.MuiAccordionSummary-expandIcon', { timeout: 10000 }).eq(2).click();
		// check that details are visible
		cy.get('.MuiAccordionDetails-root').eq(2).should('be.visible');
		// check that there are at least 11 results (loading)
		cy.get('.row', { timeout: 10000 })
			.eq(1)
			.find('[data-cy="searchCard"]', { timeout: 10000 })
			.should('have.length.gte', 6);
	});

	// Referenced by documents accordion
	it('Expands DOCUMENTS REFERENCED BY accordion and tests integrity of contents', () => {
		// expand accordion
		cy.get('.MuiAccordionSummary-expandIcon', { timeout: 10000 }).eq(3).click();
		// check that details are visible
		cy.get('.MuiAccordionDetails-root').eq(3).should('be.visible');
		// check that there are at least 11 results (loading)
		cy.get('.row', { timeout: 10000 })
			.eq(2)
			.find('[data-cy="searchCard"]', { timeout: 10000 })
			.should('have.length.gte', 10);
	});

	it('Tests navigating through results pages in SIMILAR DOCUMENTS accordion', () => {
		// expand accordion
		cy.get('.MuiAccordionSummary-expandIcon', { timeout: 10000 }).eq(1).click();
		// confirm first page number is highlighted
		cy.get('.pagination', { timeout: 10000 }).first().find('li').eq(2).should('have.class', 'active');
		// compare results on first and second page and confirm they're different
		let firstPageResults = [];
		cy.get('.row', { timeout: 10000 })
			.first()
			.find('.text', { timeout: 10000 })
			.each((val) => firstPageResults.push(val.text()));
		cy.get('.pagination', { timeout: 10000 }).eq(0).find('li').eq(3).click();
		cy.get('.row', { timeout: 10000 })
			.first()
			.find('.text', { timeout: 10000 })
			.each((val, i) => {
				expect(firstPageResults[i]).to.not.equal(val.text());
			});
	});
});
