// This Jest config only handles backend tests
// Frontend tests are handled by react-scripts
module.exports = {
  // Only run backend tests from root
  projects: [
    '<rootDir>/backend/jest.config.js'
  ],
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html', 'json-summary'],
  verbose: true
};