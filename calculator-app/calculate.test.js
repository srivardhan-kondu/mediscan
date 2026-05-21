'use strict';

const { calculate } = require('./main');

describe('calculate function', () => {
  test('should add two numbers', () => {
    expect(calculate(2, 3, 'add')).toBe(5);
  });

  test('should subtract two numbers', () => {
    expect(calculate(5, 3, 'subtract')).toBe(2);
  });

  test('should multiply two numbers', () => {
    expect(calculate(2, 3, 'multiply')).toBe(6);
  });

  test('should divide two numbers', () => {
    expect(calculate(6, 3, 'divide')).toBe(2);
  });

  test('should throw error when dividing by zero', () => {
    expect(() => calculate(6, 0, 'divide')).toThrow('Cannot divide by zero.');
  });

  test('should throw error on invalid operation', () => {
    expect(() => calculate(6, 3, 'mod')).toThrow('Invalid operation.');
  });
});
