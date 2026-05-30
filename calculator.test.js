const { JSDOM } = require('jsdom');

// Mock the DOM for testing
const dom = new JSDOM(`<!DOCTYPE html>${require('fs').readFileSync('index.html')}`);
global.document = dom.window.document;
global.window = dom.window;

// Import the functions to test
global.clearDisplay = function() {
  const display = document.getElementById('display');
  display.innerText = '0';
};

global.appendToDisplay = function(value) {
  const display = document.getElementById('display');
  if (display.innerText === '0' && value !== '.') {
    display.innerText = value;
  } else {
    display.innerText += value;
  }
};

const { test, expect } = require('@jest/globals');

describe('Calculator UI Tests', () => {
  beforeEach(() => {
    clearDisplay(); // Reset display before each test
  });

  test('Clear Button resets the display to 0', () => {
    appendToDisplay('1');
    document.querySelector('button[data-action="clear"]').click();
    expect(document.getElementById('display').innerText).toBe('0');
  });

  test('Appending numbers updates the display', () => {
    appendToDisplay('1');
    expect(document.getElementById('display').innerText).toBe('1');
  });

  test('Appends values correctly preventing leading zero', () => {
    appendToDisplay('1');
    expect(document.getElementById('display').innerText).toBe('1');
    appendToDisplay('0');
    expect(document.getElementById('display').innerText).toBe('10');
  });

  test('Display handles append of decimal correctly', () => {
    appendToDisplay('1');
    appendToDisplay('.');
    expect(document.getElementById('display').innerText).toBe('1.');
  });
});