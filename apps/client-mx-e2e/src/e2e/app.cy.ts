import { getGreeting } from '../support/app.po';

describe('client-mx', () => {
  beforeEach(() => cy.visit('/'));

  it('should render `HomePage` link', () => {
    cy.get('a').should('exist').should('have.text', 'HomePage');
  });

  it.skip('should display welcome message', () => {
    // Custom command example, see `../support/commands.ts` file
    cy.login('my-email@something.com', 'myPassword');

    // Function helper example, see `../support/app.po.ts` file
    getGreeting().contains('Welcome client-mx');
  });
});
