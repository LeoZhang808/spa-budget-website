process.env.NODE_ENV = 'test';
process.env.PORT = '4000';
process.env.DATABASE_URL = 'mysql://test:test@localhost:3306/test_db';
process.env.JWT_SECRET = 'test-jwt-secret-for-integration-tests';
process.env.REFRESH_TOKEN_SECRET = 'test-refresh-secret-for-integration-tests';
process.env.CORS_ORIGIN = 'http://localhost:3000';
