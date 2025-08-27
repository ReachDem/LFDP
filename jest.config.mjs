/** @type {import('jest').Config} */
const config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1'
  },
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: 'tsconfig.json',
    }],
  },
  testMatch: ['**/__tests__/**/*.ts?(x)', '**/__tests__/**/*.js?(x)', '**/?(*.)+(spec|test).ts?(x)', '**/?(*.)+(spec|test).js?(x)'],
  verbose: true,
  // Ajouter un fichier de configuration qui sera exécuté avant les tests
  setupFiles: ['<rootDir>/__tests__/setup-env.js'],
};

export default config;
