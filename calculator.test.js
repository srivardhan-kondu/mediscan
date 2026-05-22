const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

describe('Calculator UI Tests', () => {
    let document;
    beforeAll((done) => {
        const html = fs.readFileSync(path.resolve(__dirname, './calculator.html'), 'utf8');
        const dom = new JSDOM(html, { runScripts: 'dangerously', resources: 'usable' });
        document = dom.window.document;

        // Ensure all scripts are loaded
        dom.window.onload = () => done();
    });

    test('displays the calculator with correct title', () => {
        expect(document.title).toBe('Simple Calculator');
    });

    test('has all the necessary buttons', () => {
        const buttons = document.querySelectorAll('button');
        expect(buttons.length).toBe(17); // 0-9, +, -, *, /, =, clear, .
    });

    test('calculator display should be initially zero', () => {
        const display = document.querySelector('.display');
        expect(display.textContent.trim()).toBe('0');
    });

    test('button press updates the display', () => {
        const button = document.querySelector('button[data-value="1"]');
        const display = document.querySelector('.display');
        button.click();
        expect(display.textContent.trim()).toBe('1');
    });

    test('operators update the display correctly', () => {
        const button1 = document.querySelector('button[data-value="1"]');
        const plusButton = document.querySelector('button[data-value="+"]');
        const button2 = document.querySelector('button[data-value="2"]');
        const equalsButton = document.querySelector('button[data-value="="]');
        const display = document.querySelector('.display');

        button1.click();
        plusButton.click();
        button2.click();
        equalsButton.click();

        expect(display.textContent.trim()).toBe('3');
    });
});