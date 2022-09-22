/// <reference types="Cypress" />

beforeEach(() => {
	cy.login('gamechanger');
});

describe('Tests multiple types of policy searches.', () => {
	it('Runs a search and verifies highlighting', () => {
		const searchTerm = 'laundry';
		cy.search(searchTerm);

		cy.get('.styled-card-container')
			.should('have.length.greaterThan', 1)
			.first()
			.get('em')
			.should('contain', searchTerm);
	});

	it("Runs a search and verifies a result's references", () => {
		const searchTerm = 'CFR Title 24 Vol. 4: Housing And Urban Development';
		cy.search(searchTerm);

		cy.getDataCy('card-footer-more').first().click();
		cy.getDataCy('simple-table')
			.eq(1)
			.should('contain', 'References')
			.find('tbody')
			.find('tr')
			.first()
			.find('td')
			.first()
			.find('a')
			.should('exist');
	});

	it('Runs a search and verifies organization card results', () => {
		const searchTerm = 'washington headquarters service';
		cy.search(searchTerm);

		cy.switchResultsTab('Organizations');
		cy.getCard(0)
			.find('.text')
			.then(() => {
				cy.get('iframe').then((el) => el.remove());
				cy.getCard(0).find('.text').should('contain', 'Washington Headquarters Service');
				cy.getCard(0).find('img').should('exist');
				cy.getCard(0)
					.find('p')
					.should(
						'contain',
						'Washington Headquarters Services (WHS) is a Department of Defense (DoD) Field Activity, created on October 1, 1977'
					);
			});
	});

	it('Runs a question search and verifies the answer box exists', () => {
		const searchTerm = 'who is sergeant major of the army?';
		cy.search(searchTerm);
		cy.getDataCy('qa-result-card');
		cy.getDataCy('qa-result-title').should('have.text', searchTerm.toUpperCase());
	});

	it('Runs a search with multiple words inside quotes and verifies highlighting', () => {
		const searchTerm = 'machine learning';
		cy.search(searchTerm);
		cy.get('.styled-card-container')
			.should('have.length.greaterThan', 1)
			.first()
			.get('em')
			.should('contain.text', searchTerm.split(' ')[0] && searchTerm.split(' ')[1]);
	});

	it('Runs a search that contains intelligent results and verifies it is displayed', () => {
		const searchTerm = 'logistics';
		cy.search(searchTerm);
		cy.getDataCy('intelligent-result').should('exist');
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
	const openAllAccordions = () => {
		cy.get('#accordion-header').get('p').contains('FAVORITE TOPICS').click();
		cy.get('#accordion-header').get('p').contains('FAVORITE ORGANIZATIONS').click();
		cy.get('#accordion-header').get('p').contains('FAVORITE DOCUMENTS').click();
	};

	const deleteIFrameIfExists = () => {
		cy.get('iframe', { timeout: 500, force: true }).then((el) => el.remove());
	};

	beforeEach('Clear the favorites', () => {
		cy.visitGcPage('gamechanger/userDashboard');
		cy.get('.react-tabs').then(($tabs) => {
			if ($tabs.find('.main-info').length) {
				openAllAccordions();
				cy.getDataCy('favorite-star').each(($star) => {
					cy.wrap($star).click();
					cy.get('button').contains('Yes').click();
				});
				cy.getDataCy('favorite-star').should('not.exist');
			}
		});
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

		cy.getCard(0).get('em').should('contain.text', searchTerm.toUpperCase());

		cy.getDataCy('user-dashboard').click();
		cy.getFavoriteCard(favoriteTitle)
			.should('exist')
			.parentsUntil('[data-cy="favorite-card"]')
			.findDataCy('favorite-star')
			.click();
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
				cy.getFavoriteCard(titleText)
					.should('exist')
					.parentsUntil('[data-cy="favorite-card"]')
					.findDataCy('favorite-star')
					.click();
				//cy.getDataCy('favorite-star').click();
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
				deleteIFrameIfExists();
				cy.get('button').contains('Save').click();
				cy.getDataCy('user-dashboard').click();
				cy.get('#accordion-header').get('p').contains('FAVORITE ORGANIZATIONS').click();
				cy.getFavoriteCard(titleText).should('exist');
				cy.getDataCy('favorite-star').click();
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
				deleteIFrameIfExists();
				cy.get('button').contains('Save').click();
				cy.getDataCy('user-dashboard').click();
				cy.get('#accordion-header').get('p').contains('FAVORITE TOPICS').click();
				cy.getFavoriteCard(titleText).should('exist');
				cy.getDataCy('favorite-star').click();
				cy.get('button').contains('Yes').click();
				cy.getFavoriteCard(titleText).should('not.exist');
			});
	});
});

describe('Tests for the Data Status Tracker', () => {
	beforeEach('Navigate to DST', () => {
		cy.getDataCy('data-status-tracker').click();
		cy.get('.rt-td>div').find('a').should('exist'); //Waits for table to load
		cy.setupDSTIntercepts();
	});
	it('Switches between tabs', () => {
		cy.getDataCy('data-status-tracker').click();
		cy.get('.-loading.-active', { timeout: 30000 }).should('not.exist');
		cy.switchDstTab('documents-tab');
		cy.switchDstTab('knowledge-graph-tab');
		cy.switchDstTab('progress-tab');
		cy.switchDstTab('documents-tab');
		cy.switchDstTab('knowledge-graph-tab');
		cy.get('.rt-tr-group').should('exist');
	});

	it('Applies filters to the Progress tab', () => {
		const sourceFilter = 'Military';
		cy.typeIntoDstFilter(0, sourceFilter + '{enter}');
		cy.waitForProgressTableToLoad();
		cy.wait(750); //This is bad, but the elements arent 'settling' immediately after the loading overlay dissapears and test is not consistent without it
		cy.get('.rt-td').first().find('a').contains(sourceFilter).should('be.visible');
	});

	it('Applies filters to the Documents tab', () => {
		const typeFilter = 'AAMedP';
		const titleFilter = 'AEROSPACE';

		cy.switchDstTab('documents-tab');
		cy.typeIntoDstFilter(0, typeFilter);
		cy.waitForDocumentsTableToLoad();
		cy.typeIntoDstFilter(2, titleFilter);
		cy.waitForDocumentsTableToLoad();
		cy.wait(750);

		cy.get('.rt-td>div').first().contains(typeFilter).should('exist');
		cy.get('.rt-td').eq(2).contains(titleFilter);
	});

	it('Verifies the Knowledge Graph has results', () => {
		cy.get('.-loading.-active', { timeout: 30000 }).should('not.exist');
		cy.switchDstTab('knowledge-graph-tab');
		cy.get('h3').contains('Knowledge Overview').should('exist');
		cy.get('.rt-tr-group').should('have.length.greaterThan', 100);
	});
});
