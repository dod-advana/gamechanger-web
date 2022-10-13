/// <reference types="Cypress" />

describe('Tests multiple types of policy searches.', () => {
	beforeEach(() => {
		cy.login('gamechanger');
	});

	it('Should be able to search for a policy by name.', () => {
		cy.search('AFMAN 11-2EC-130HV1');
		// Wait for the results to be visible
		cy.getDataCy('results-Documents', { timeout: 10000 }).should('exist');

		// Results should have more than 1
		cy.getDataCy('results-Documents').find('[data-cy="searchCard"]').should('have.length.greaterThan', 1);

		// First result should have the correct name
		cy.getDataCy('results-Documents')
			.find('[data-cy="policy-card-header"]', { timeout: 10000 })
			.first()
			.should('contain', 'AFMAN 11-2EC-130HV1 EC-130H AIRCREW TRAINING');
	});

	it('Runs a search and verifies highlighting', () => {
		const searchTerm = 'laundry';
		cy.search(searchTerm);

		cy.get('.styled-card-container', { timeout: 10000 })
			.should('have.length.greaterThan', 1)
			.first()
			.get('em')
			.should('contain', searchTerm);
	});

	it('Runs a question search and verifies the answer box exists', () => {
		const searchTerm = 'who is sergeant major of the army?';
		cy.search(searchTerm);
		cy.getDataCy('qa-result-card', { timeout: 10000 });
		cy.getDataCy('qa-result-title').should('have.text', searchTerm.toUpperCase());
	});

	it('Runs a search with multiple words inside quotes and verifies highlighting', () => {
		const searchTerm = 'machine learning';
		cy.search(searchTerm);
		cy.get('.styled-card-container', { timeout: 10000 })
			.should('have.length.greaterThan', 1)
			.first()
			.get('em')
			.should('contain.text', searchTerm.split(' ')[0] && searchTerm.split(' ')[1]);
	});

	it('Runs a search that contains intelligent results and verifies it is displayed', () => {
		const searchTerm = 'logistics';
		cy.search(searchTerm);
		cy.getDataCy('intelligent-result', { timeout: 10000 }).should('exist');
		cy.getDataCy('intelligent-result-title').should('exist');
	});

	// it.only('Opens a PDF and verifies the search term is highlighted in the document', () => {
	//     const searchTerm = 'pizza';
	//     cy.search(searchTerm);
	//     getCard(0).find('a').contains('Open').click();
	//     //cy.getCard(0).find('a').contains('Open').click();
	// }); Cypress can't handle new tabs, need to find a way to open doc without new tab opening
});

describe('User Dashboard Tests', () => {
	beforeEach(() => {
		cy.login('gamechanger');
	});

	it('Favorites a search and verifies its values in the User Dashboard', () => {
		const searchTerm = 'pizza';
		const favoriteTitle = 'AutoTest Title';

		cy.search(searchTerm);
		cy.getDataCy('searchbar-favorite-star').click();
		cy.getDataCy('search-favorite-save-dialog').find('input').type(favoriteTitle);
		cy.getDataCy('search-favorite-save-dialog').find('textarea').type('AutoTest Summary');
		cy.getDataCy('search-favorite-save-dialog').find('button').contains('Save').click();

		cy.getDataCy('user-dashboard').click();

		cy.getFavoriteCard(favoriteTitle).invoke('removeAttr', 'target').click();

		cy.getCard(0, { timeout: 10000 }).get('em').should('contain.text', searchTerm.toUpperCase());

		cy.getDataCy('user-dashboard').click();
		cy.getDataCy('favorite-star', { timeout: 10000 }).click();
		cy.get('button').contains('Yes').click();
		cy.getFavoriteCard(favoriteTitle).should('not.exist');
	});

	it('Favorites a document and verifies it exists in the User Dashboard', () => {
		const searchTerm = 'helicopter';

		cy.search(searchTerm);
		cy.getCard(0)
			.find('.text')
			.then((card) => {
				const titleText = card.text();

				cy.getCard(0).findDataCy('card-favorite-star').click();
				cy.get('button').contains('Save').click();
				cy.getDataCy('user-dashboard').click();
				cy.get('#accordion-header').get('p').contains('FAVORITE DOCUMENTS').click();
				cy.getFavoriteCard(titleText).should('exist');
				cy.getDataCy('favorite-star', { timeout: 10000 }).click();
				cy.get('button').contains('Yes').click();
				cy.getFavoriteCard(titleText).should('not.exist');
			});
	});

	it('Favorites an organization and verifies it exists in the User Dashboard', () => {
		const searchTerm = 'West point';

		cy.search(searchTerm);
		cy.switchResultsTab('Organizations');
		cy.getCard(0)
			.find('.text')
			.then((card) => {
				const titleText = card.text();

				cy.getCard(0).findDataCy('card-favorite-star').click();
				cy.get('button').contains('Save').click();
				cy.getDataCy('user-dashboard').click();
				cy.get('#accordion-header').get('p').contains('FAVORITE ORGANIZATIONS').click();
				cy.getFavoriteCard(titleText).should('exist');
				cy.getDataCy('favorite-star', { timeout: 10000 }).click();
				cy.get('button').contains('Yes').click();
				cy.getFavoriteCard(titleText).should('not.exist');
			});
	});

	it('Favorites a topic and verifies it exists in the User Dashboard', () => {
		const searchTerm = 'Military';

		cy.search(searchTerm);
		cy.switchResultsTab('Topic');
		cy.getCard(0)
			.find('.text')
			.then((card) => {
				const titleText = card.text();

				cy.getCard(0).findDataCy('card-favorite-star').click();
				cy.get('button').contains('Save').click();
				cy.getDataCy('user-dashboard').click();
				cy.get('#accordion-header').get('p').contains('FAVORITE TOPICS').click();
				cy.getFavoriteCard(titleText).should('exist');
				cy.getDataCy('favorite-star', { timeout: 10000 }).click();
				cy.get('button').contains('Yes').click();
				cy.getFavoriteCard(titleText).should('not.exist');
			});
	});
});
