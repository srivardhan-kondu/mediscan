const { JSDOM } = require('jsdom');

// Mock the DOM
const dom = new JSDOM(`<!DOCTYPE html>${require('fs').readFileSync('index.html', 'utf-8')}`);
global.document = dom.window.document;
global.window = dom.window;
global.navigator = dom.window.navigator;

// Assume calculator.js is the correct location of calculator functions
require('./calculator.js');

// Jest Test Cases

describe('Calculator UI', () => {
  test('calculator screen is present', () => {
    const screen = document.querySelector('.screen');
    expect(screen).not.toBeNull();
  });

  test('all buttons are present', () => {
    const buttons = document.querySelectorAll('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  test('buttons layout grid', () => {
    const buttonsContainer = document.querySelector('.buttons');
    expect(window.getComputedStyle(buttonsContainer).gridTemplateColumns).toBe('repeat(4, 1fr)');
  });
});

describe('Calculator Operations', () => {
  test('addition functionality', () => {
    simulateButtonPress('5');
    simulateButtonPress('+');
    simulateButtonPress('3');
    simulateButtonPress('=');
    const screen = document.querySelector('.screen');
    expect(screen.value).toBe('8');
  });

  test('division by zero', () => {
    simulateButtonPress('5');
    simulateButtonPress('/');
    simulateButtonPress('0');
    simulateButtonPress('=');
    const screen = document.querySelector('.screen');
    expect(screen.value).toBe('Error');
  });
});

function simulateButtonPress(buttonValue) {
  const button = Array.from(document.querySelectorAll('button')).find(b => b.textContent.trim() === buttonValue);
  if (button) {
    button.click();
  }
}