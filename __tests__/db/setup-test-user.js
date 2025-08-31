// __tests__/db/setup-test-user.js
/**
 * Ce script crée un utilisateur de test dans la base de données
 * Exécutez ce script avant d'exécuter les tests pour garantir que l'utilisateur de test existe
 */

require('dotenv').config({ path: './.env.test' });
const path = require('path');
const { db } = require('../../lib/drizzle');
const { user } = require('../../db/auth-schema');

async function createTestUser() {
  try {
    // Vérifier si l'utilisateur de test existe déjà
    const existingUser = await db.query.user.findFirst({
      where: (u) => u.id.equals('test-user-id-123')
    });

    if (existingUser) {
      console.log('L\'utilisateur de test existe déjà');
      return existingUser;
    }

    // Créer l'utilisateur de test
    const newUser = await db.insert(user).values({
      id: 'test-user-id-123',
      name: 'Test User',
      email: 'test@example.com',
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();

    console.log('Utilisateur de test créé:', newUser[0]);
    return newUser[0];
  } catch (error) {
    console.error('Erreur lors de la création de l\'utilisateur de test:', error);
    throw error;
  }
}

// Exécuter la fonction si le script est exécuté directement
if (require.main === module) {
  require('dotenv').config({ path: '.env.test' });
  createTestUser()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Erreur:', error);
      process.exit(1);
    });
}

module.exports = createTestUser;
