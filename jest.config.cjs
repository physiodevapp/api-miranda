module.exports = {
  "testEnvironment": "node",
  "transform": {
    "^.+.tsx?$": ["ts-jest",{}],
  },
  "setupFilesAfterEnv": ["./jest.setup.cjs"],
  "setupFiles": [
    './jest.env.cjs'
  ],
  "testMatch": ["**/src/**/*.test.ts"]
}