const fs = require('fs');
const { JSDOM } = require('jsdom');

// Load the HTML content
const html = fs.readFileSync('index.html', 'utf-8');

// Setup JSDOM
const dom = new JSDOM(html, {
    runScripts: 'dangerously',
    resources: 'usable',
    pretendToBeVisual: true
});

const { window } = dom;
const document = window.document;

// Wait for scripts to execute before proceeding
dom.window.addEventListener('DOMContentLoaded', () => {
    const calculator = document.querySelector('.calculator-keys');
    const display = document.querySelector('.calculator-screen');

    // Test cases
    const testCalculator = () => {
        setTimeout(() => { // Ensure everything is loaded
            // Simulate button clicks
            const button1 = document.querySelector('button[value="1"]');
            const buttonPlus = document.querySelector('button[value="+"]');
            const button2 = document.querySelector('button[value="2"]');
            const buttonEquals = document.querySelector('button[value="="]');

            button1.click();
            buttonPlus.click();
            button2.click();
            buttonEquals.click();

            // Check the result
            const expectedResult = '3';
            if (display.value !== expectedResult) {
                console.error(`Test failed: expected ${expectedResult}, but got ${display.value}`);
            } else {
                console.log('Test passed');
            }

            // Reset
            document.querySelector('button[value="all-clear"]').click();
        }, 100); // Adjust timeout if necessary
    };

    testCalculator();
});