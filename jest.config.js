/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',  
  collectCoverage: false,
  testPathIgnorePatterns : [
    "__tests__/classes", 
    "__tests__/*/*.d.ts"       
  ]
  
};