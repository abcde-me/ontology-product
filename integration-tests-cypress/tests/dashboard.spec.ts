import { checkErrors } from '../support';

describe('Console Module Template Demo Test', () => {
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
    cy.visit('/dashboard/workplace');
    [
      'overview',
      'popular-contents',
      'content-percentage',
      'shortcuts',
      'carousel',
      'announcement',
      'docs',
    ].forEach((testId) => {
      cy.byLegacyTestID(testId).should('exist');
    });
  });
});
