module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  // collectCoverageFrom: [
  //   '**/*.(t|j)s',
  //   '!**/*.module.ts',
  //   '!**/node_modules/**',
  //   '!**/dist/**',
  // ],
  // coverageDirectory: './coverage',
  testEnvironment: 'node',
  roots: ['<rootDir>/src/'],
  moduleNameMapper: {
    '^@auth/(.*)$': '<rootDir>/src/auth/$1',
    '^@common/(.*)$': '<rootDir>/src/common/$1',
    '^@users/(.*)$': '<rootDir>/src/users/$1',
    '^@permissions/(.*)$': '<rootDir>/src/permissions/$1',
    '^@brands/(.*)$': '<rootDir>/src/brands/$1',
    '^@categories/(.*)$': '<rootDir>/src/categories/$1',
    '^@education-levels/(.*)$': '<rootDir>/src/education-levels/$1',
    '^@sizes/(.*)$': '<rootDir>/src/sizes/$1',
    '^@files/(.*)$': '<rootDir>/src/files/$1',
    '^@products/(.*)$': '<rootDir>/src/products/$1',
    '^@target-audiences/(.*)$': '<rootDir>/src/target-audiences/$1',
    // Añade cualquier otro alias que uses en tu proyecto
  },
  // setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
};