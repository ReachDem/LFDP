/**
 * @jest-environment node
 */

const { describe, expect, test, beforeEach, beforeAll, afterAll } = require('@jest/globals');
const { db } = require('@/lib/drizzle');
const { stores, categories, products } = require('@/db/schema');
const { eq } = require('drizzle-orm');
const createTestUser = require('./setup-test-user');

// Mock Next.js's revalidatePath function
jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(() => null),
}));

// Mock auth - Utilisation d'une fausse session avec un ID fixe pour tous les tests
jest.mock('@/lib/auth', () => ({
  auth: {
    validateSession: jest.fn(() => Promise.resolve({
      user: {
        id: 'test-user-id-123',
      }
    }))
  },
}));

// Import les actions
const { createStore, deleteStore } = require('@/app/actions/stores');
const { createCategory } = require('@/app/actions/categories');
const { createProduct } = require('@/app/actions/products');

describe('Test des actions de création d\'entités', () => {
  // Variable pour stocker les IDs créés pendant les tests
  let testStoreId;
  let testCategoryId;
  let testProductId;
  let testUser;

  // Créer l'utilisateur de test avant tous les tests
  beforeAll(async () => {
    try {
      // Créer l'utilisateur de test
      testUser = await createTestUser();
      console.log('Utilisateur de test disponible pour les tests avec ID:', testUser.id);
    } catch (error) {
      console.error('Erreur lors de la configuration des tests:', error);
    }
  });

  // Nettoyer la base de données après tous les tests
  afterAll(async () => {
    if (testStoreId) {
      // Supprimer les données de test pour ne pas polluer la base de données
      try {
        // La suppression du magasin devrait cascade supprimer les catégories et produits associés
        // si ce n'est pas le cas, il faudrait supprimer manuellement les produits et catégories
        await db.delete(stores).where(eq(stores.id, testStoreId));
        console.log('Données de test nettoyées avec succès');
      } catch (error) {
        console.error('Erreur lors du nettoyage des données de test:', error);
      }
    }
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('createStore insère réellement un magasin dans la base de données', async () => {
    const storeName = `Test Store ${Date.now()}`; // Nom unique pour éviter les conflits
    
    const result = await createStore({
      name: storeName,
      description: 'Test store description',
      email: 'test@example.com'
    });
    
    // Vérifier que la création a réussi
    expect(result).toBeDefined();
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.data.name).toBe(storeName);
    
    // Stocker l'ID pour les tests suivants
    testStoreId = result.data.id;
    
    // Vérifier que le magasin existe réellement dans la base de données
    const storedStores = await db.select().from(stores).where(eq(stores.id, testStoreId));
    expect(storedStores.length).toBe(1);
    expect(storedStores[0].name).toBe(storeName);
    
    console.log(`Magasin créé avec ID: ${testStoreId}`);
  });

  test('createCategory insère réellement une catégorie dans la base de données', async () => {
    // S'assurer qu'un magasin a été créé
    expect(testStoreId).toBeDefined();
    
    const categoryName = `Test Category ${Date.now()}`;
    
    const result = await createCategory({
      name: categoryName,
      storeId: testStoreId // Utiliser l'ID du magasin créé précédemment
    });
    
    // Vérifier que la création a réussi
    expect(result).toBeDefined();
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.data.name).toBe(categoryName);
    
    // Stocker l'ID pour les tests suivants
    testCategoryId = result.data.id;
    
    // Vérifier que la catégorie existe réellement dans la base de données
    const storedCategories = await db.select().from(categories).where(eq(categories.id, testCategoryId));
    expect(storedCategories.length).toBe(1);
    expect(storedCategories[0].name).toBe(categoryName);
    expect(storedCategories[0].storeId).toBe(testStoreId);
    
    console.log(`Catégorie créée avec ID: ${testCategoryId}`);
  });

  test('createProduct insère réellement un produit dans la base de données', async () => {
    // S'assurer qu'un magasin et une catégorie ont été créés
    expect(testStoreId).toBeDefined();
    expect(testCategoryId).toBeDefined();
    
    const productName = `Test Product ${Date.now()}`;
    
    const result = await createProduct({
      name: productName,
      price: 19.99,
      stockQuantity: 100,
      alertThreshold: 10,
      categoryId: testCategoryId, // Utiliser l'ID de la catégorie créée précédemment
      storeId: testStoreId, // Utiliser l'ID du magasin créé précédemment
      isPublished: true
    });
    
    // Vérifier que la création a réussi
    expect(result).toBeDefined();
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.data.name).toBe(productName);
    
    // Stocker l'ID pour une utilisation ultérieure si nécessaire
    testProductId = result.data.id;
    
    // Vérifier que le produit existe réellement dans la base de données
    const storedProducts = await db.select().from(products).where(eq(products.id, testProductId));
    expect(storedProducts.length).toBe(1);
    expect(storedProducts[0].name).toBe(productName);
    expect(storedProducts[0].storeId).toBe(testStoreId);
    expect(storedProducts[0].categoryId).toBe(testCategoryId);
    
    console.log(`Produit créé avec ID: ${testProductId}`);
  });
});
