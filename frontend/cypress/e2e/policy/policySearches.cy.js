describe('Tests multiple types of policy searches.', () => {
	beforeEach(() => {
		cy.login('gamechanger')
    });
    it('Should be able to search for a policy by name.', () => {
        cy.search('AFI 16-1301');
		// Wait for the results to be visible
		cy.get('[data-cy="results-Documents"]', { timeout: 10000 }).should('exist');

		// Results should have more than 1
		cy.get('[data-cy="results-Documents"]').find('[data-cy="searchCard"]').should('have.length.greaterThan', 1);

		// First result should have the correct name
		cy.get('[data-cy="results-Documents"]', { timeout: 10000 })
			.find('[data-cy="searchCard"]')
			.first()
			.should('contain', 'AFI 16-1301 SURVIVAL EVASION RESISTANCE AND ESCAPE (SERE) PROGRAM');
	});

	it('Runs a search and verifies highlighting', () => {
		const searchTerm = 'laundry';
        cy.search(searchTerm);
        
		cy.get('.styled-card-container', { timeout: 10000 })
            .should('have.length.greaterThan', 1)
            .first().get('em').should('contain', searchTerm);
    });
    
    it.only('Runs a question search and verifies the answer box exists', () => {
        const searchTerm = "who is sergeant major of the army?";
        cy.search(searchTerm);
        cy.getDataCy('qa-result-card', {timeout: 10000});
        cy.getDataCy('qa-result-title').should("have.text", searchTerm.toUpperCase());
    });

    it('Runs a search with multiple words inside quotes and verifies highlighting', () => {
        const searchTerm = 'machine learning';
        cy.search(searchTerm);
        cy.get('.styled-card-container', { timeout: 10000 }).should('have.length.greaterThan', 1)
            .first().get('em').should("contain.text", searchTerm.split(" ")[0] && searchTerm.split(" ")[1]);
    });

    it('Runs a search that contains intelligent results and verifies it is displayed', () => {
        const searchTerm = 'army';
        cy.search(searchTerm);
        cy.getDataCy('intelligent-result', {timeout: 10000}).should("exist");
        cy.getDataCy('intelligent-result-title').should("exist");
    });
});
