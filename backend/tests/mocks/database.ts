const createMockModel = () => ({
  findUnique: jest.fn(),
  findFirst: jest.fn(),
  findFirstOrThrow: jest.fn(),
  findMany: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  count: jest.fn(),
});

export const prismaMock = {
  user: createMockModel(),
  category: createMockModel(),
  transaction: createMockModel(),
  budget: createMockModel(),
  $queryRaw: jest.fn(),
  $disconnect: jest.fn(),
};
