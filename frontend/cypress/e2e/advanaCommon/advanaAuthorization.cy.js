import CypressHelper from '../../support/CypressHelper';

describe('Tests the authorization api', () => {
	const cypressHelper = new CypressHelper(cy);

	it('Should be unauthorized to view the gamechanger admin page', () => {
		// Setting headers to a fake person
		cypressHelper.setupHeaders('not.a.person.1234567890', '1234567890@mil');

		// Visit the main page
		cy.visit(Cypress.env('BASE_URL') + '/#/gamechanger-admin');

		// Check the page is not unauthorized
		cy.get('[data-cy="unauthorized-page"]').should('exist');
	});

	it('Should be authorized to view the gamechanger admin page', () => {
		// Set headers to good headers
		cypressHelper.setupHeaders();

		// Visit the main page
		cy.visit(Cypress.env('BASE_URL') + '/#/gamechanger-admin');

		// Check the page is unauthorized
		cy.get('[data-cy="unauthorized-page"]').should('not.exist');
	});
});
