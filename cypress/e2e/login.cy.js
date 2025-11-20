const FIREBASE_API_KEY = Cypress.env('FIREBASE_API_KEY') || 'AIzaSyAfQkjP5FypLOx4pHf9WrkV3V_6nGkxG2o'
const BASE_URL = Cypress.config().baseUrl || 'http://localhost:5173'

const createCredentials = () => {
  const unique = Date.now()
  return {
    email: `cypress.login+${unique}@example.com`,
    password: `Test!${unique}Aa`
  }
}

const ensureFirebaseUser = ({ email, password }) => {
  return cy.request({
    method: 'POST',
    url: `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${FIREBASE_API_KEY}`,
    body: {
      email,
      password,
      returnSecureToken: true
    },
    failOnStatusCode: false
  }).then((response) => {
    const errorCode = response.body?.error?.message
    if (response.status === 200 || errorCode === 'EMAIL_EXISTS') {
      return
    }
    throw new Error(`No se pudo preparar el usuario de pruebas: ${errorCode || response.status}`)
  })
}

const dismissWelcomeModalIfVisible = () => {
  cy.get('body').then(($body) => {
    const modal = $body.find('.modal.show')
    if (modal.length) {
      cy.wrap(modal)
        .first()
        .within(() => {
          cy.contains('button', /Entendido|Aceptar|Cerrar/i).click({ force: true })
        })
    }
  })
}

const performSuccessfulLogin = (credentials) => {
  cy.login(credentials.email, credentials.password, { visit: false })
  cy.url({ timeout: 15000 }).should('eq', `${BASE_URL}/`)
  dismissWelcomeModalIfVisible()
}

const assertNavbarForUser = (email) => {
  cy.get('[data-cy="user-email"]', { timeout: 10000 }).should('contain', email)
  cy.get('[data-cy="logout-btn"]').should('be.visible')
}

const logoutFromNavbar = () => {
  dismissWelcomeModalIfVisible()
  cy.get('[data-cy="logout-btn"]', { timeout: 10000 }).click({ force: true })
  cy.url({ timeout: 10000 }).should('include', '/login')
}

describe('Login Functionality', () => {
  const testCredentials = createCredentials()

  before(() => {
    ensureFirebaseUser(testCredentials)
  })

  beforeEach(() => {
    cy.visit('/login')
  })

  afterEach(() => {
    cy.get('body').then(($body) => {
      if ($body.find('[data-cy="logout-btn"]').length) {
        logoutFromNavbar()
      }
    })
  })

  it('should display login form', () => {
    // Verificar que los elementos del formulario estén presentes
    cy.get('#email').should('be.visible')
    cy.get('#password').should('be.visible')
    cy.get('button[type="submit"]').should('be.visible')
    cy.contains('Iniciar Sesión').should('be.visible')
  })

  it('should show error for invalid credentials', () => {
    // Intentar login con credenciales inválidas
    cy.get('#email').type('invalid@email.com')
    cy.get('#password').type('wrongpassword')
    cy.get('button[type="submit"]').click()

    // Verificar que se muestre un mensaje de error
    cy.get('.alert-danger').should('be.visible')
  })

  it('should show validation errors for empty fields', () => {
    // Intentar enviar formulario vacío
    cy.get('button[type="submit"]').click()

    // Los campos requeridos deberían mostrar validación del navegador
    cy.get('#email:invalid').should('exist')
    cy.get('#password:invalid').should('exist')
  })

  it('should redirect to register page', () => {
    // Hacer clic en el enlace de registro
    cy.contains('Regístrate aquí').click()
    
    // Verificar que se redirija a la página de registro
    cy.url().should('include', '/register')
  })

  it('should login successfully with valid credentials', () => {
    performSuccessfulLogin(testCredentials)
    assertNavbarForUser(testCredentials.email)
    logoutFromNavbar()
  })

  it('should maintain session after page reload', () => {
    performSuccessfulLogin(testCredentials)
    cy.reload()
    dismissWelcomeModalIfVisible()
    assertNavbarForUser(testCredentials.email)
    logoutFromNavbar()
  })

  it('should logout successfully', () => {
    performSuccessfulLogin(testCredentials)
    logoutFromNavbar()
  })
})