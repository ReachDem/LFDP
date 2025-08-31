/**
 * @jest-environment node
 */

const { describe, expect, test, beforeEach } = require('@jest/globals');

// Données de test
const mockStores = [];
const mockCategories = [];
const mockProducts = [];
let currentUserId = 'user-1';

// Fonction simulée pour créer un magasin
let idCounter = 1;
function createStore(data) {
  const store = {
    id: `store-${idCounter++}-${Date.now()}`,
    name: data.name,
    userId: currentUserId,
    isActive: data.isActive,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  mockStores.push(store);
  return { success: true, data: store };
}

// Fonction simulée pour créer une catégorie
function createCategory(data) {
  // Vérifier que le magasin appartient à l'utilisateur actuel
  const store = mockStores.find(s => s.id === data.storeId);
  
  if (!store) {
    return { success: false, error: 'Store not found' };
  }
  
  if (store.userId !== currentUserId) {
    return { success: false, error: 'Store not owned by user' };
  }
  
  const category = {
    id: `category-${Date.now()}`,
    name: data.name,
    storeId: data.storeId,
    createdAt: new Date()
  };
  
  mockCategories.push(category);
  return { success: true, data: category };
}

// Fonction simulée pour créer un produit
function createProduct(data) {
  // Vérifier que le magasin appartient à l'utilisateur actuel
  const store = mockStores.find(s => s.id === data.storeId);
  
  if (!store) {
    return { success: false, error: 'Store not found' };
  }
  
  if (store.userId !== currentUserId) {
    return { success: false, error: 'Store not owned by user' };
  }
  
  // Vérifier que la catégorie appartient au magasin
  const category = mockCategories.find(c => c.id === data.categoryId);
  
  if (!category) {
    return { success: false, error: 'Category not found' };
  }
  
  if (category.storeId !== data.storeId) {
    return { success: false, error: 'Category not from this store' };
  }
  
  const product = {
    id: `product-${Date.now()}`,
    name: data.name,
    price: data.price,
    stockQuantity: data.stockQuantity,
    alertThreshold: data.alertThreshold,
    categoryId: data.categoryId,
    storeId: data.storeId,
    isPublished: data.isPublished,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  mockProducts.push(product);
  return { success: true, data: product };
}

// Fonction simulée pour mettre à jour un magasin
function updateStore(storeId, data) {
  // Afficher plus d'informations pour le débogage
  console.log(`Tentative de mise à jour du magasin ${storeId} par l'utilisateur ${currentUserId}`);
  console.log('Magasins disponibles:', mockStores);
  
  const storeIndex = mockStores.findIndex(s => s.id === storeId);
  
  if (storeIndex === -1) {
    console.log(`Magasin ${storeId} non trouvé`);
    return { success: false, error: 'Store not found' };
  }
  
  const store = mockStores[storeIndex];
  console.log('Magasin trouvé:', store);
  
  if (store.userId !== currentUserId) {
    console.log(`Le magasin appartient à ${store.userId}, mais l'utilisateur courant est ${currentUserId}`);
    return { success: false, error: 'Store not owned by user' };
  }
  
  const updatedStore = {
    ...store,
    ...data,
    updatedAt: new Date()
  };
  
  mockStores[storeIndex] = updatedStore;
  console.log('Magasin mis à jour avec succès:', updatedStore);
  return { success: true, data: updatedStore };
}

// Fonction simulée pour supprimer un magasin
function deleteStore(storeId) {
  const storeIndex = mockStores.findIndex(s => s.id === storeId);
  
  if (storeIndex === -1) {
    return { success: false, error: 'Store not found' };
  }
  
  const store = mockStores[storeIndex];
  
  if (store.userId !== currentUserId) {
    return { success: false, error: 'Store not owned by user' };
  }
  
  const deletedStore = mockStores.splice(storeIndex, 1)[0];
  return { success: true, data: deletedStore };
}

// Tests
describe('Test des opérations CRUD avec des fonctions simulées', () => {
  beforeEach(() => {
    // Réinitialiser les données de test
    mockStores.length = 0;
    mockCategories.length = 0;
    mockProducts.length = 0;
    currentUserId = 'user-1';
  });
  
  test('Un utilisateur peut créer un magasin', () => {
    const result = createStore({
      name: 'Mon Magasin Test',
      isActive: true
    });
    
    expect(result.success).toBe(true);
    expect(result.data.name).toBe('Mon Magasin Test');
    expect(result.data.userId).toBe('user-1');
    expect(mockStores.length).toBe(1);
  });
  
  test('Un utilisateur peut créer une catégorie dans son magasin', () => {
    // Créer d'abord un magasin
    const storeResult = createStore({
      name: 'Magasin Test',
      isActive: true
    });
    
    // Créer une catégorie dans ce magasin
    const categoryResult = createCategory({
      name: 'Catégorie Test',
      storeId: storeResult.data.id
    });
    
    expect(categoryResult.success).toBe(true);
    expect(categoryResult.data.name).toBe('Catégorie Test');
    expect(categoryResult.data.storeId).toBe(storeResult.data.id);
    expect(mockCategories.length).toBe(1);
  });
  
  test('Un utilisateur peut créer un produit dans une catégorie de son magasin', () => {
    // Créer d'abord un magasin
    const storeResult = createStore({
      name: 'Magasin Test',
      isActive: true
    });
    
    // Créer une catégorie dans ce magasin
    const categoryResult = createCategory({
      name: 'Catégorie Test',
      storeId: storeResult.data.id
    });
    
    // Créer un produit dans cette catégorie
    const productResult = createProduct({
      name: 'Produit Test',
      price: 19.99,
      stockQuantity: 50,
      alertThreshold: 10,
      categoryId: categoryResult.data.id,
      storeId: storeResult.data.id,
      isPublished: true
    });
    
    expect(productResult.success).toBe(true);
    expect(productResult.data.name).toBe('Produit Test');
    expect(productResult.data.categoryId).toBe(categoryResult.data.id);
    expect(productResult.data.storeId).toBe(storeResult.data.id);
    expect(mockProducts.length).toBe(1);
  });
  
  test('Un utilisateur ne peut pas créer une catégorie dans un magasin qui ne lui appartient pas', () => {
    // Créer d'abord un magasin pour l'utilisateur 1
    const storeResult = createStore({
      name: 'Magasin User 1',
      isActive: true
    });
    
    // Changer l'utilisateur courant
    currentUserId = 'user-2';
    
    // User 2 tente de créer une catégorie dans le magasin de User 1
    const categoryResult = createCategory({
      name: 'Catégorie Non Autorisée',
      storeId: storeResult.data.id
    });
    
    expect(categoryResult.success).toBe(false);
    expect(categoryResult.error).toContain('not owned by user');
    expect(mockCategories.length).toBe(0);
  });
  
  test('Un utilisateur peut mettre à jour son propre magasin', () => {
    // Créer d'abord un magasin
    const storeResult = createStore({
      name: 'Magasin à Mettre à Jour',
      isActive: true
    });
    
    // Mettre à jour le magasin
    const updateResult = updateStore(storeResult.data.id, {
      name: 'Magasin Mis à Jour',
      isActive: false
    });
    
    expect(updateResult.success).toBe(true);
    expect(updateResult.data.name).toBe('Magasin Mis à Jour');
    expect(updateResult.data.isActive).toBe(false);
    expect(mockStores[0].name).toBe('Magasin Mis à Jour');
  });
  
  test('Un utilisateur ne peut pas mettre à jour le magasin d\'un autre utilisateur', () => {
    // Créer d'abord un magasin pour l'utilisateur 1
    const storeResult = createStore({
      name: 'Magasin User 1',
      isActive: true
    });
    
    // Changer l'utilisateur courant
    currentUserId = 'user-2';
    
    // User 2 tente de mettre à jour le magasin de User 1
    const updateResult = updateStore(storeResult.data.id, {
      name: 'Tentative de Modification'
    });
    
    expect(updateResult.success).toBe(false);
    expect(updateResult.error).toContain('not owned by user');
    expect(mockStores[0].name).toBe('Magasin User 1');
  });
  
  test('Un utilisateur peut supprimer son propre magasin', () => {
    // Créer d'abord un magasin
    const storeResult = createStore({
      name: 'Magasin à Supprimer',
      isActive: true
    });
    
    // Supprimer le magasin
    const deleteResult = deleteStore(storeResult.data.id);
    
    expect(deleteResult.success).toBe(true);
    expect(mockStores.length).toBe(0);
  });
  
  test('Un utilisateur ne peut pas supprimer le magasin d\'un autre utilisateur', () => {
    // Créer d'abord un magasin pour l'utilisateur 1
    const storeResult = createStore({
      name: 'Magasin User 1',
      isActive: true
    });
    
    // Changer l'utilisateur courant
    currentUserId = 'user-2';
    
    // User 2 tente de supprimer le magasin de User 1
    const deleteResult = deleteStore(storeResult.data.id);
    
    expect(deleteResult.success).toBe(false);
    expect(deleteResult.error).toContain('not owned by user');
    expect(mockStores.length).toBe(1);
  });
  
  test('Deux utilisateurs peuvent avoir leurs propres magasins', () => {
    // User 1 crée un magasin
    const store1Result = createStore({
      name: 'Magasin User 1',
      isActive: true
    });
    
    // User 2 crée un magasin
    currentUserId = 'user-2';
    const store2Result = createStore({
      name: 'Magasin User 2',
      isActive: true
    });
    
    expect(mockStores.length).toBe(2);
    expect(mockStores[0].userId).toBe('user-1');
    expect(mockStores[1].userId).toBe('user-2');
    
    // User 2 peut modifier son propre magasin
    const updateUser2 = updateStore(store2Result.data.id, {
      name: 'Magasin User 2 Mis à Jour'
    });
    
    expect(updateUser2.success).toBe(true);
    
    // User 2 ne peut pas modifier le magasin de User 1
    const updateUser1ByUser2 = updateStore(store1Result.data.id, {
      name: 'Tentative de Modification'
    });
    
    expect(updateUser1ByUser2.success).toBe(false);
    expect(updateUser1ByUser2.error).toContain('not owned by user');
    
    // Vérifier les noms des magasins après les tentatives de modification
    expect(mockStores[0].name).toBe('Magasin User 1');
    expect(mockStores[1].name).toBe('Magasin User 2 Mis à Jour');
  });
});
