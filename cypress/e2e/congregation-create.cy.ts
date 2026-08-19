/// <reference types="cypress" />

const FIREBASE_AUTH_EMULATOR = 'http://127.0.0.1:9099';
const FIRESTORE_EMULATOR = 'http://127.0.0.1:8080';
const PROJECT_ID = 'organized-local';
// The browser signs in against the Vite development API origin. Keep the direct
// validation request on that same host so Cypress sends the signed __session
// cookie that the sign-in response established.
const API_HOST = 'http://localhost:8000';
const FIREBASE_API_KEY = 'organized-local-api-key';

describe('authenticated congregation creation', () => {
  const suffix = `${Date.now()}-${Cypress._.random(100000, 999999)}`;
  const email = `cypress-congregation-${suffix}@example.test`;
  const password = 'CypressTestPassword123!';
  const adminDocumentUrl = `${FIRESTORE_EMULATOR}/v1/projects/${PROJECT_ID}/databases/(default)/documents/admins/${encodeURIComponent(email)}`;
  let idToken = '';
  let localId = '';

  before(() => {
    cy.request({
      method: 'POST',
      url: `${FIREBASE_AUTH_EMULATOR}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=${FIREBASE_API_KEY}`,
      body: { email, password, returnSecureToken: true },
    }).then(({ body }) => {
      idToken = body.idToken;
      localId = body.localId;

      cy.request({
        method: 'PATCH',
        url: adminDocumentUrl,
        body: { fields: { source: { stringValue: 'cypress' } } },
      });
    });
  });

  after(() => {
    cy.request({ method: 'DELETE', url: adminDocumentUrl, failOnStatusCode: false });

    cy.request({
      method: 'POST',
      url: `${FIREBASE_AUTH_EMULATOR}/identitytoolkit.googleapis.com/v1/accounts:delete?key=${FIREBASE_API_KEY}`,
      body: { localId },
      failOnStatusCode: false,
    });
  });

  it('normalizes a free congregation name without registry traffic', () => {
    const rawName = `  Pôr do Sol Cypress ${suffix}  `;
    const normalizedName = rawName.trim();

    cy.intercept('POST', '**/api/v3/admin-email-password-signin').as('signIn');
    cy.intercept('GET', '**/api/v3/congregations/countries*').as('countryList');
    cy.intercept('GET', '**/api/v3/congregations/search*').as('congregationSearch');
    cy.intercept('GET', 'https://collect-api.sws2apps.com/**').as('externalRegistry');

    cy.visit('/', {
      onBeforeLoad(window) {
        window.indexedDB.deleteDatabase('firebaseLocalStorageDb');
        window.indexedDB.deleteDatabase('organized');
      },
    });
    cy.contains(/email login|login por e-mail/i).click();
    cy.get('input[type="checkbox"]').last().check({ force: true });
    cy.contains('button', /next|próximo/i).click();
    cy.get('input[type="text"]').first().type(email);
    cy.get('input[type="password"]').type(password);
    cy.contains('button', /log in|entrar/i).click();
    cy.wait('@signIn').its('response.statusCode').should('eq', 200);
    cy.contains(/create congregation|criar congregação/i).should('be.visible');

    // This must execute in the authenticated browser context: the API validates
    // both Firebase's bearer token and the signed device-session cookie.
    cy.window().then((window) => {
      return window
        .fetch(`${API_HOST}/api/v3/congregations`, {
          method: 'PUT',
          credentials: 'include',
          headers: {
            Authorization: `Bearer ${idToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            country_code: 'tampered',
            country_guid: 'tampered',
            cong_name: '   ',
            firstname: 'Cypress',
            lastname: '',
          }),
        })
        .then((response) => {
          expect(response.status).to.equal(400);
        });
    });

    cy.intercept('PUT', '**/api/v3/congregations').as('createCongregation');
    cy.contains('button', /create congregation|criar congregação/i).click();
    cy.contains(/body of elders|corpo de anciãos/i).should('be.visible');
    cy.get('input:not([type="checkbox"])')
      .eq(0)
      .type('Cypress')
      .should('have.value', 'Cypress');
    cy.get('input:not([type="checkbox"])')
      .eq(3)
      .type(rawName)
      .blur()
      .should('have.value', normalizedName);
    cy.get('input[type="checkbox"]').last().check({ force: true });
    cy.contains('button', /create congregation|criar congregação/i).click();

    cy.wait('@createCongregation').then(({ request, response }) => {
      expect(request.url).to.equal(`${API_HOST}/api/v3/congregations`);
      expect(request.body.cong_name).to.equal(normalizedName);
      expect(response?.statusCode, JSON.stringify(response?.body)).to.equal(200);
      expect(response?.body.cong_settings.cong_name).to.equal(normalizedName);
      expect(response?.body.cong_settings.country_code).to.equal('BRA');
    });

    cy.get('@countryList.all').should('have.length', 0);
    cy.get('@congregationSearch.all').should('have.length', 0);
    cy.get('@externalRegistry.all').should('have.length', 0);
    cy.contains(/create master key|criar chave mestra/i).should('be.visible');
  });
});
