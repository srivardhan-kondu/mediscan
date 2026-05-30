const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');
const { expect } = require('@jest/globals');

const html = fs.readFileSync(path.resolve(__dirname, './index.html'), 'utf8');
let dom;
let document;

beforeEach(() => {
  dom = new JSDOM(html, { runScripts: 'dangerously', resources: 'usable' });
  document = dom.window.document;
});

function clickButton(action, value) {
  const button = document.querySelector(`button[data-action="${action}"][data-value="${value}"]`);
  button.click();
}

function getDisplayValue() {
  return document.getElementById('display').textContent;
}

describe('Calculator UI', () => {
  test('displays 0 on start', () => {
    expect(getDisplayValue()).toBe('0');
  });

  test('should add numbers correctly', () => {
    clickButton('append', '1');
    clickButton('append', '2');
    expect(getDisplayValue()).toBe('12');
    clickButton('operator', '+');
    clickButton('append', '3');
    clickButton('equals');
    expect(getDisplayValue()).toBe('15');
  });

  test('should clear display', () => {
    clickButton('append', '5');
    clickButton('clear');
    expect(getDisplayValue()).toBe('0');
  });

  test('should handle division by zero gracefully', () => {
    clickButton('append', '8');
    clickButton('operator', '/');
    clickButton('append', '0');
    clickButton('equals');
    expect(getDisplayValue()).toBe('Infinity');
  });

  test('should handle multiple operations correctly', () => {
    clickButton('append', '7');
    clickButton('operator', '*');
    clickButton('append', '6');
    clickButton('operator', '-');
    clickButton('append', '4');
    clickButton('equals');
    expect(getDisplayValue()).toBe('38');
  });

  test('should respond to button clicks (hover state)', () => {
    const button = document.querySelector('button');
    button.dispatchEvent(new dom.window.MouseEvent('mouseover', { bubbles: true }));
    expect(button.style.backgroundColor).toBe('rgb(208, 208, 208)'); // assuming CSS hover works, won't reflect CSS-in-JSDOM
  });
});