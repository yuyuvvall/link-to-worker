export default {
    preset: 'ts-jest',
    testEnvironment: 'node',
    testTimeout: 15000,
    setupFiles: ['dotenv/config'],
    collectCoverageFrom: [
        'src/**/*.ts',
        '!src/**/*.test.ts',
        '!src/app.ts'
    ]
}
