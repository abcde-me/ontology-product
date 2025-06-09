import { checkErrors } from '../support';

describe('Console Module Template Example Test', () => {
  before(() => {
    // cy.login();
  });

  afterEach(() => {
    cy.window().then((win) => {
      if (win?.windowError?.indexOf('ResizeObserver loop') === -1) {
        checkErrors();
      }
    });
  });
  after(() => {
    // cy.logout();
  });

  // 虚机生命周期管理
  it('Template Dashboard Structure Complete', () => {
    cy.visit('/example');
    cy.byLegacyTestID('content').should(
      'have.text',
      'You can add content here :)',
    );
  });
});
