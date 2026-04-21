module.exports = {
  testEnvironment: 'node',
  verbose: true,
  collectCoverage: true,
  coverageDirectory: 'coverage',
  roots: [
    '<rootDir>/tests'
  ],
  testMatch: [
    '**/*.test.js'
  ],
  rootDir: '.',
  collectCoverageFrom: [
    'api/**/*.js',
    '../public/js/**/*.js',
  ],
  testPathIgnorePatterns: ['/node_modules/'],
  setupFilesAfterEnv: ['./jest.setup.js'],
  moduleNameMapper: {
    '^https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js$': '<rootDir>/../public/js/firebase.js',
    '^https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js$': '<rootDir>/__mocks__/firebase-auth.js',
    '^https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js$': '<rootDir>/__mocks__/firebase-firestore.js',
    '^https://www.gstatic.com/firebasejs/10.12.0/firebase-functions.js$': '<rootDir>/__mocks__/firebase-functions.js',
    '^https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js$': '<rootDir>/__mocks__/firebase-firestore.js',
    '^./firebase.js$': '<rootDir>/../public/js/firebase.js'
  },
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
};
