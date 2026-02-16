export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testTimeout: 10000,
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.test.ts',
    '!src/app.ts'
  ]
}
