module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/test/**/*.test.js'],
  collectCoverage: true,
  coverageReporters: ["html", "text", "lcov"],
  coverageDirectory: "coverage",
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/test/**',
    '!src/migrations/**',
    '!src/seeders/**'
  ],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
};
