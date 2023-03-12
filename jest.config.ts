/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',  
  collectCoverage: true,
  testPathIgnorePatterns : [
    "__tests__/classes", 
    "__test__/*/*.d.ts"       
  ]
  
};