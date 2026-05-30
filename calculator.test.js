const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

// Load the HTML content
const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf-8');

// Setup JSDOM
const dom = new JSDOM(html, {
    runScripts: 'dangerously',
    resources: 'usable'
});

const { window } = dom;

window.addEventListener('DOMContentLoaded', () => {
    const document = window.document;
    const calculatorKeys = document.querySelector('.calculator-keys');
    const display = document.querySelector('.calculator-screen');

    const testCalculator = () => {
        const button1 = document.querySelector('button[value="1"]');
        const buttonPlus = document.querySelector('button[value="+"]');
        const button2 = document.querySelector('button[value="2"]');
        const buttonEquals = document.querySelector('button[value="="]');

        button1.click();
        buttonPlus.click();
        button2.click();
        buttonEquals.click();

        const expectedResult = '3';
        if (display.value !== expectedResult) {
            console.error(`Test failed: expected ${expectedResult}, but got ${display.value}`);
        } else {
            console.log('Test passed');
        }

        document.querySelector('button[value="all-clear"]').click();
    };

    testCalculator();
});
