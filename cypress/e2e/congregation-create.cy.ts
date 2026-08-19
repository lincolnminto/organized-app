/// <reference types="cypress" />

const FIREBASE_AUTH_EMULATOR = 'http://127.0.0.1:9099';
const FIRESTORE_EMULATOR = 'http://127.0.0.1:8080';
const PROJECT_ID = 'organized-local';
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
    const rawName = '  Pôr do Sol - Lagoa Santa MG  ';
    const normalizedName = rawName.trim();

    cy.intercept('POST', '**/api/v3/admin-email-password-signin').as('signIn');
    cy.intercept('PUT', '**/api/v3/congregations').as('createCongregation');
    cy.intercept('GET', '**/api/v3/congregations/countries*').as('countryList');
    cy.intercept('GET', '**/api/v3/congregations/search*').as('congregationSearch');
    cy.intercept('GET', 'https://collect-api.sws2apps.com/**').as('externalRegistry');

    cy.visit('/');
    cy.get('input[type="text"]').first().type(email);
    cy.get('input[type="password"]').type(password);
    cy.contains('button', /log in|entrar/i).click();
    cy.wait('@signIn').its('response.statusCode').should('eq', 200);

    cy.request({
      method: 'PUT',
      url: `${API_HOST}/api/v3/congregations`,
      headers: { Authorization: `Bearer ${idToken}` },
      body: {
        country_code: 'tampered',
        country_guid: 'tampered',
        cong_name: '   ',
        firstname: 'Cypress',
        lastname: '',
      },
      failOnStatusCode: false,
    }).its('status').should('eq', 400);

    cy.get('input').eq(0).type('Cypress');
    cy.get('input').eq(3).type(rawName).blur();
    cy.get('input[type="checkbox"]').check();
    cy.contains('button', /create congregation|criar congregação/i).click();

    cy.wait('@createCongregation').then(({ request, response }) => {
      expect(request.body.cong_name).to.equal(normalizedName);
      expect(response?.statusCode).to.equal(200);
      expect(response?.body.cong_settings.cong_name).to.equal(normalizedName);
      expect(response?.body.cong_settings.country_code).to.equal('BRA');
    });

    cy.get('@countryList.all').should('have.length', 0);
    cy.get('@congregationSearch.all').should('have.length', 0);
    cy.get('@externalRegistry.all').should('have.length', 0);
    cy.contains(/create master key|criar chave mestra/i).should('be.visible');
  });
});
