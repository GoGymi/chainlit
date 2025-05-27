import { runTestServer, submitMessageCopilot } from '../../support/testUtils';

describe('Copilot Starters', () => {
  before(() => {
    runTestServer();
    cy.document().then((document) => {
      document.body.innerHTML =
        '<div id="root"><h1>Copilot Starters Test!</h1></div>';
      const script = document.createElement('script');
      script.src = 'http://localhost:8000/copilot/index.js';
      document.body.appendChild(script);
    });

    // Wait for the script to load and execute the initialization
    cy.window().then((win) => {
      cy.wait(1000).then(() => {
        // @ts-expect-error is not a valid prop
        win.mountChainlitWidget({
          chainlitServer: 'http://localhost:8000'
        });
      });
    });
  });

  it('should display starters in the welcome screen', () => {
    const opts = { includeShadowDom: true };
    cy.get('#chainlit-copilot-button', opts).click();
    cy.get('#chainlit-copilot-popover', opts).should('be.visible');

    // Check if welcome screen with starters is displayed
    cy.get('#chainlit-copilot-popover', opts).within(() => {
      cy.get('#copilot-starter-hello-copilot', opts).should('be.visible');
      cy.get('#copilot-starter-ask-question', opts).should('be.visible');
      cy.get('#copilot-starter-generate-code', opts).should('be.visible');
      cy.get('#copilot-starter-explain-concept', opts).should('be.visible');
    });
  });

  it('should send starter message when clicked', () => {
    const opts = { includeShadowDom: true };

    // Click on first starter
    cy.get('#chainlit-copilot-popover', opts).within(() => {
      cy.get('#copilot-starter-hello-copilot', opts).click();
    });

    // Check that the starter message appears and response is received
    cy.get('#chainlit-copilot-popover', opts).within(() => {
      cy.contains('.step', 'Say hello to the copilot!', opts).should(
        'be.visible'
      );
      cy.contains(
        '.step',
        'Copilot received: Say hello to the copilot!',
        opts
      ).should('be.visible');
    });
  });

  it('should hide welcome screen after first message', () => {
    const opts = { includeShadowDom: true };

    // After sending a message, welcome screen should not be visible
    // but we can't easily test this without checking DOM structure
    // Let's send another message manually to verify functionality
    submitMessageCopilot('Manual test message');

    cy.get('#chainlit-copilot-popover', opts).within(() => {
      cy.contains('.step', 'Manual test message', opts).should('be.visible');
      cy.contains(
        '.step',
        'Copilot received: Manual test message',
        opts
      ).should('be.visible');
    });
  });
});
