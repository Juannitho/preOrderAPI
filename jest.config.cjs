// Explicit .cjs so this always loads as CommonJS regardless of the
// project's "type": "module" — avoids any ESM config-loading ambiguity.
//
// Scoped to spec/ only, and never to test/ — that directory holds the
// node:test + Supertest integration suite (npm test), a separate runner
// with its own conventions. Keeping the two fully apart avoids either
// runner trying to execute the other's files.
module.exports = {
    testEnvironment: 'node',
    transform: {},
    testMatch: ['<rootDir>/spec/**/*.spec.js'],
};
