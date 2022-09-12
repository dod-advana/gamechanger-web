declare namespace Cypress {
	interface Chainable<Subject> {
		/**
		 * Sets up headers and clears cookies
		 */
		setup();

		/**
		 * Only accepts the consent banner
		 */
		accept_consent();

		/**
		 * Visits the given clone and accepts the DoD consent banner
		 * @example cy.visit_accept_consent('Gamechanger')
		 */
		visit_accept_consent(clone: string);

		/**
		 * Custom command to select DOM element by data-cy attribute.
		 * @example cy.getDataCy('greeting', {timeout: 10000})
		 */
		getDataCy(value: string, options?: any): Chainable<Element>;

		/**
		 * Custom command to select child DOM elements by data-cy attribute.
		 * @example cy.getDataCy('greeting').findDataCy('card-button').click()
		 */
		findDataCy(value: string, options?: any): Chainable<Element>;

		/**
		 * Clears cookies, navigates to given clone, and accepts the consent banner
		 * @example cy.login('Gamechanger')
		 */
		login(clone: string);

		/**
		 * Types into the search bar and clicks the search button.
		 * Also waits up to 60 seconds for search results to appear.
		 * @param searchTerm
		 * @example cy.search('United States Army')
		 */
		search(searchTerm: string);

		/**
		 * Expands the Source accordion and selects a source filter from the sidebar
		 */
		setSourceFilter(sourceFilter: string);

		/**
		 * Expands the Type accordion and selects a type filter from the sidebar
		 */
		setTypeFilter(typeFilter: string);

		/**
		 * Grabs the base of a card at the given index. You will need to chain other cypress commands to do other tasks
		 * such as, get the title, description, click open, etc... The example below will get the first card and then click the Open button on the card.
		 * @param index
		 * @param options
		 * @example cy.getCard(1, {timeout: 10000}).find('a').contains('Open').click();
		 */
		getCard(index: number, options?: any): Chainable<Element>;

		/**
		 * Grabs the base element of a favorite card by its title
		 * @param favoriteTitle
		 * @param options
		 */
		getFavoriteCard(favoriteTitle: string, options?: any): Chainable<Element>;

		/**
		 * Switch between the tabs under the Search Bar (Organizations, Topics, Documents)
		 * @param tabName
		 * @example cy.switchResultsTab('Organizations');
		 */
		switchResultsTab(tabName: string);

		/**
		 * Switch tabs from within Data Status Tracker.
		 * Valid Data Cy tags = {'progress-tab' | 'documents-tab' | 'knowledge-graph-tab'}
		 * @param dstTabDataCyTag
		 * @example cy.switchDstTab('progress-tab');
		 */
		switchDstTab(dstTabDataCyTags: string);

		/**
		 * Sets up the API Intercepts for the DST Tables, This allows you to use the waitFor____TableToLoad commands
		 * Should probably be used in the BeforeAll or BeforeEach test step
		 */
		setupDSTIntercepts();

		/**
		 * Waits for the Progress table to load.
		 * MUST HAVE CALLED setupDSTIntercepts() before this is called
		 */
		waitForProgressTableToLoad();

		/**
		 * Waits for the Documents table to load.
		 * MUST HAVE CALLED setupDSTIntercepts() before this is called
		 */
		waitForDocumentsTableToLoad();
	}
}
