const FIREBASE_API_KEY = Cypress.env('FIREBASE_API_KEY') || 'AIzaSyAfQkjP5FypLOx4pHf9WrkV3V_6nGkxG2o'
const BASE_URL = Cypress.config().baseUrl || 'http://localhost:5173'

const adminCredentials = (() => {
  const unique = Date.now()
  return {
    email: `cypress.admin+${unique}@example.com`,
    password: `Admin!${unique}Aa`
  }
})()

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
    throw new Error(`No se pudo crear el usuario admin de pruebas: ${errorCode || response.status}`)
  })
}

const loginAsAdmin = () => {
  cy.login(adminCredentials.email, adminCredentials.password)
  cy.url({ timeout: 15000 }).should('eq', `${BASE_URL}/`)
  cy.visit('/admin')
  cy.contains('Administración de Cursos', { timeout: 20000 }).should('be.visible')
  cy.get('table', { timeout: 20000 }).should('be.visible')
}

const generateCourseData = () => {
  const unique = Date.now()
  return {
    codigo: `CYP-${unique}`,
    nombre: `Curso Cypress ${unique}`,
    descripcion: 'Curso generado automáticamente para pruebas end-to-end.',
    precio: 45000,
    duracion: '1 mes',
    cupos: 25,
    inscritos: 0,
    estado: true,
    img: 'https://via.placeholder.com/150?text=Cypress+Course'
  }
}

const fillCourseForm = (course) => {
  cy.get('#codigo').clear().type(course.codigo)
  cy.get('#nombre').clear().type(course.nombre)
  cy.get('#descripcion').clear().type(course.descripcion)
  cy.get('#precio').clear().type(`${course.precio}`)
  cy.get('#duracion').clear().type(course.duracion)
  cy.get('#cupos').clear().type(`${course.cupos}`)
  cy.get('#inscritos').clear().type(`${course.inscritos}`)
  cy.get('#img').clear().type(course.img)

  if (course.estado) {
    cy.get('#estado').check({ force: true })
  } else {
    cy.get('#estado').uncheck({ force: true })
  }
}

const createCourseViaUI = (course) => {
  cy.get('[data-cy="open-add-form-btn"]').click()
  fillCourseForm(course)
  cy.get('[data-cy="confirm-add-btn"]').click()
  cy.get('[data-cy="confirm-add-course-btn"]').click()

  cy.get('.modal.show', { timeout: 20000 })
    .should('contain.text', 'Operación exitosa')
    .contains('button', 'Aceptar')
    .click()

  cy.contains('tr', course.nombre, { timeout: 20000 }).should('exist')
}

const openDeleteModalForCourse = (courseName) => {
  cy.contains('tr', courseName, { timeout: 20000 }).within(() => {
    cy.get('[data-cy="delete-course-btn"]').click()
  })

  cy.get('[data-cy="confirm-delete-modal"]').should('be.visible')
}

const confirmDeleteForCourse = (course) => {
  cy.get('[data-cy="confirm-delete-btn"]').click()

  cy.get('.modal.show', { timeout: 20000 })
    .should('contain.text', 'Curso eliminado correctamente.')
    .contains('button', 'Aceptar')
    .click()

  cy.contains('tr', course.nombre, { timeout: 20000 }).should('not.exist')
}

const cancelDeleteModal = () => {
  cy.get('[data-cy="cancel-delete-btn"]').click()
  cy.get('[data-cy="confirm-delete-modal"]').should('not.be.visible')
}

describe('Delete Course Functionality', () => {
  before(() => {
    ensureFirebaseUser(adminCredentials)
  })

  beforeEach(() => {
    loginAsAdmin()
  })

  afterEach(() => {
    cy.get('body').then(($body) => {
      if ($body.find('[data-cy="logout-btn"]').length) {
        cy.get('[data-cy="logout-btn"]').click({ force: true })
        cy.url({ timeout: 10000 }).should('include', '/login')
      }
    })
  })

  it('should display a newly created course in the admin table', () => {
    const course = generateCourseData()
    createCourseViaUI(course)
    cy.contains('td', course.codigo).should('be.visible')

    // Limpieza
    openDeleteModalForCourse(course.nombre)
    confirmDeleteForCourse(course)
  })

  it('should show delete confirmation modal with course details', () => {
    const course = generateCourseData()
    createCourseViaUI(course)

    openDeleteModalForCourse(course.nombre)
    cy.contains('¿Realmente deseas eliminar').should('be.visible')
    cy.contains(course.nombre).should('be.visible')
    cy.get('[data-cy="cancel-delete-btn"]').should('be.visible')
    cy.get('[data-cy="confirm-delete-btn"]').should('be.visible')

    cancelDeleteModal()

    // Limpieza
    openDeleteModalForCourse(course.nombre)
    confirmDeleteForCourse(course)
  })

  it('should keep the course when the user cancels the deletion', () => {
    const course = generateCourseData()
    createCourseViaUI(course)

    openDeleteModalForCourse(course.nombre)
    cancelDeleteModal()
    cy.contains('tr', course.nombre).should('exist')

    // Limpieza final
    openDeleteModalForCourse(course.nombre)
    confirmDeleteForCourse(course)
  })

  it('should delete the course after confirming the modal', () => {
    const course = generateCourseData()
    createCourseViaUI(course)

    openDeleteModalForCourse(course.nombre)
    confirmDeleteForCourse(course)
  })
})