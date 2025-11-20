import { initializeApp } from 'firebase/app'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  getAuth
} from 'firebase/auth'
import firebaseOptions from '../src/firebase/options.js'

const adminUsers = [
  {
    email: 'admin.catalogo@adweb.com',
    password: 'Admin123*',
    displayName: 'Admin Catálogo'
  },
  {
    email: 'admin.ventas@adweb.com',
    password: 'Admin123*',
    displayName: 'Admin Ventas'
  }
]

const seedApp = initializeApp(firebaseOptions, 'admin-seeder')
const auth = getAuth(seedApp)

const projectId = firebaseOptions?.projectId
if (!projectId) {
  console.error('No se pudo inferir projectId desde src/firebase/config.js')
  process.exit(1)
}

const buildFieldsPayload = (user, metadata) => {
  const now = new Date().toISOString()
  const base = {
    uid: { stringValue: user.uid },
    email: { stringValue: (user.email || metadata.email).toLowerCase() },
    role: { stringValue: 'admin' },
    displayName: { stringValue: metadata.displayName || '' },
    seededAt: { timestampValue: now },
    updatedAt: { timestampValue: now }
  }
  return base
}

const ensureProfileWithAdminRole = async (user, metadata) => {
  const idToken = await user.getIdToken()
  const documentName = `projects/${projectId}/databases/(default)/documents/userProfiles/${user.uid}`
  const params = new URLSearchParams()
  for (const field of ['uid', 'email', 'role', 'displayName', 'seededAt', 'updatedAt']) {
    params.append('updateMask.fieldPaths', field)
  }

  const response = await fetch(`https://firestore.googleapis.com/v1/${documentName}?${params.toString()}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    },
    body: JSON.stringify({ fields: buildFieldsPayload(user, metadata) })
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`No se pudo registrar rol admin para ${metadata.email}: ${errorText}`)
  }
}

const ensureAdminUser = async (definition) => {
  let credential
  try {
    credential = await createUserWithEmailAndPassword(auth, definition.email, definition.password)
    console.log(`✔ Usuario creado: ${definition.email}`)
  } catch (error) {
    if (error?.code === 'auth/email-already-in-use') {
      console.log(`ℹ Usuario ya existía, reutilizando credenciales para ${definition.email}`)
      credential = await signInWithEmailAndPassword(auth, definition.email, definition.password)
    } else {
      throw error
    }
  }

  try {
    await ensureProfileWithAdminRole(credential.user, definition)
  } catch (error) {
    console.warn(`⚠ No se pudo actualizar userProfiles para ${definition.email}: ${error.message}`)
  }
  await signOut(auth)

  return {
    email: definition.email,
    uid: credential.user.uid
  }
}

const main = async () => {
  const results = []
  try {
    for (const admin of adminUsers) {
      const info = await ensureAdminUser(admin)
      results.push(info)
    }

    console.log('\nUsuarios administradores listos:')
    for (const entry of results) {
      console.log(` - ${entry.email} (uid: ${entry.uid})`)
    }
  } catch (error) {
    console.error('Error creando usuarios admin:', error)
    process.exitCode = 1
  }
}

main()
