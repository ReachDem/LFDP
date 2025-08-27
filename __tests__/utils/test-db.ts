import { newDb } from 'pg-mem';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from '@/db/schema';

// Cette fonction configure une base de données en mémoire pour les tests
export function setupTestDb() {
  // Créer une instance de base de données en mémoire
  const pgMem = newDb();
  
  // Ajouter support pour UUID
  pgMem.registerExtension('uuid-ossp', () => {
    return {
      'uuid_generate_v4': () => 
        'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
          const r = Math.random() * 16 | 0;
          const v = c === 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        })
    };
  });
  
  // Configurer gen_random_uuid
  pgMem.registerFunction({
    name: 'gen_random_uuid',
    implementation: () => 
      'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      })
  });

  // Configurer now() pour les timestamps
  pgMem.registerFunction({
    name: 'now',
    implementation: () => new Date()
  });

  // Obtenir un client de connexion compatible postgres.js
  const postgres = pgMem.adapters.createPg();
  
  // Créer l'instance drizzle avec notre schéma
  const db = drizzle(postgres as any, { schema });
  
  // Migration: Créer les tables
  const queries = [
    // Tables d'authentification
    `CREATE TABLE IF NOT EXISTS "user" (
      "id" TEXT PRIMARY KEY, 
      "name" TEXT NOT NULL, 
      "email" TEXT NOT NULL UNIQUE,
      "email_verified" BOOLEAN NOT NULL DEFAULT FALSE,
      "image" TEXT,
      "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
      "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
    );`,
    
    // Table des magasins
    `CREATE TABLE IF NOT EXISTS "stores" (
      "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      "name" TEXT NOT NULL,
      "description" TEXT,
      "logo" TEXT,
      "banner_image" TEXT,
      "address" TEXT,
      "phone" TEXT,
      "email" TEXT,
      "website_url" TEXT,
      "is_active" BOOLEAN NOT NULL DEFAULT TRUE,
      "user_id" TEXT NOT NULL REFERENCES "user"("id"),
      "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
      "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
    );`,
    
    // Table des catégories
    `CREATE TABLE IF NOT EXISTS "categories" (
      "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      "name" TEXT NOT NULL,
      "store_id" UUID NOT NULL REFERENCES "stores"("id"),
      "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
      UNIQUE("store_id", "name")
    );`,
    
    // Table des produits
    `CREATE TABLE IF NOT EXISTS "products" (
      "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      "name" TEXT NOT NULL,
      "description" TEXT,
      "price" NUMERIC(10, 2) NOT NULL,
      "stock_quantity" INTEGER NOT NULL,
      "alert_threshold" INTEGER NOT NULL,
      "category_id" UUID REFERENCES "categories"("id"),
      "image_url" TEXT,
      "store_id" UUID NOT NULL REFERENCES "stores"("id"),
      "is_published" BOOLEAN NOT NULL DEFAULT TRUE,
      "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
      "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
    );`
  ];
  
  // Exécuter les requêtes pour créer les tables
  for (const query of queries) {
    postgres.query(query);
  }

  return { db, pgMem };
}
