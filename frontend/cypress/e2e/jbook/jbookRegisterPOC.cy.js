describe('Tests the JBook register POC page', () => {
	beforeEach(() => {
		cy.setup();
    cy.visit_accept_consent('jbook-register-poc');
	});

	it('Should redirect to /userDashboard', () => {
		cy.url().should('eq', 'http://localhost:8080/#/jbook/userDashboard');
	});

  it('should open the user edit modal if email not filled out yet', () => {
    cy.getDataCy('EditProfile').should('exist');
		cy.getDataCy('firstName').find('input').should('have.value', 'AUTO');
		cy.getDataCy('lastName').find('input').should('have.value', 'TEST');
		cy.getDataCy('email').find('input').should('have.value', '');
  });
});
