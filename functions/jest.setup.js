// Global setup for tests
// Mocking process.env for secrets
process.env.RECAPTCHA_API = 'test-secret';
process.env.GEMINI_API_KEY = 'test-gemini-key';
process.env.SEARLO_API_KEY = 'test-searlo-key';
