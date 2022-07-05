import CypressHelper, { BASE_URL } from '../../support/CypressHelper';

describe('Tests multiple types of policy searches.', () => {
	it('Should be able to search for a policy by name.', () => {
		CypressHelper.setupHeaders(cy);
		// Clear cookies
		cy.clearCookies();

		// Visit the main page
		cy.visit(`${BASE_URL}/#/gamechanger`);

		// Click the okay button
		cy.get('[data-cy="consent-agreement-okay"]').click();
	});
});
