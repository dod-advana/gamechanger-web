describe('Tests multiple types of jbook searches.', () => {
	beforeEach(() => {
		cy.setup();
		cy.visit_accept_consent(
            'jbook/profile?type=RDT%26E&searchText=%22Navigation%20and%20Timing%22&id=rdoc#2023#PB#07#0205778A#21#N/A#2040#EG3&appropriationNumber=2040&portfolioName=General&budgetYear=2023'
		);
        cy.getDataCy('jbook-project-descriptions', { timeout: 10000 }).should('exist');
	});

	it('Search text with quotes should be highlighted on the portfolio page', () => {
		// Check highlighted text exists
        cy.get('[style="background-color:#1C2D64;color:white;padding:0 4px"]').should('exist');
	});
});
