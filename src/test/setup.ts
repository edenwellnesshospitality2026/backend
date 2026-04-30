process.env.NODE_ENV = "test";
process.env.PORT = "8090";
process.env.DATABASE_URL = "postgres://postgres:postgres@localhost:5432/eden_test";
process.env.CORS_ORIGINS = "http://localhost:8080";
process.env.JWT_SECRET = "test_secret_key_12345";
process.env.JWT_EXPIRES_IN = "12h";
