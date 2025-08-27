-- Ce script crée un utilisateur de test dans la base de données
-- Exécutez ce script directement dans votre interface Neon ou via un outil SQL
-- avant d'exécuter les tests

-- Insérer un utilisateur de test (s'il n'existe pas déjà)
INSERT INTO "user" (id, name, email, email_verified, created_at, updated_at)
VALUES 
  ('test-user-id-123', 'Test User', 'test@example.com', true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Vérifier que l'utilisateur a été créé
SELECT * FROM "user" WHERE id = 'test-user-id-123';
