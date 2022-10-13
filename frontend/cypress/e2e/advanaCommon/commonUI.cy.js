describe('Tests the advanaCommon functionality of the app including side nav and consent banner.', () => {
	beforeEach(() => {
		cy.setup();
		cy.visit(`/#/gamechanger`);
	});

	// Test the consent banner appears and a cookie is created when okay clicked
	it('The consent banner should be there.', () => {
		// Check the consent banner is there
		cy.getDataCy('consent-agreement', { timeout: 10000 }).should('exist');
	});

	it('The consent banner should be gone with a cookie showing agreement.', () => {
		cy.accept_consent();

		// Check the consent banner is not there
		cy.getDataCy('consent-agreement').should('not.exist');

		// Get the consent cookie
		cy.getCookie('data.mil-consent-agreed').should('exist');
	});
});
