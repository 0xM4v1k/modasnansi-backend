// jest.setup.js
const mockRepository = {
  find: jest.fn().mockResolvedValue([]),
  findOne: jest.fn().mockResolvedValue({}),
  findAndCount: jest.fn().mockResolvedValue([[], 0]),
  create: jest.fn().mockReturnValue({}),
  save: jest.fn().mockResolvedValue({}),
  update: jest.fn().mockResolvedValue({}),
  remove: jest.fn().mockResolvedValue({}),
};

// Mock automático para getRepositoryToken
jest.mock('@nestjs/typeorm', () => ({
  ...jest.requireActual('@nestjs/typeorm'),
  getRepositoryToken: jest.fn().mockReturnValue('RepositoryToken'),
  InjectRepository: jest.fn(),
}));

// Mock global para los providers de test
jest.mock('@nestjs/testing', () => {
  const original = jest.requireActual('@nestjs/testing');
  return {
    ...original,
    Test: {
      ...original.Test,
      createTestingModule: (metadata) => {
        // Añadir automáticamente todos los repositorios como mocks
        metadata.providers = metadata.providers || [];
        metadata.providers.push({
          provide: 'RepositoryToken',
          useValue: mockRepository,
        });
        
        return original.Test.createTestingModule(metadata);
      },
    },
  };
});