module.exports = {
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '\\.(css|less)$': 'identity-obj-proxy'
  },
  transform: {
    '^.+\\.[t|j]sx?$': 'babel-jest'
  }
};