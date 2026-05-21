const fs = require('fs');
const path = require('path');

jest.mock('fs');

describe('calculatorApp', () => {
    let calculatorApp, document;

    beforeEach(() => {
        document = {
            getElementById: jest.fn().mockImplementation((id) => {
                const elements = {};
                elements[id] = { value: '', addEventListener: jest.fn() };
                return elements[id];
            })
        };
        calculatorApp = require('./frontend_ui');
        calculatorApp.cacheDom = jest.fn();
        calculatorApp.bindEvents = jest.fn();
    });

    it('should call cacheDom and bindEvents on init', () => {
        calculatorApp.init();
        expect(calculatorApp.cacheDom).toHaveBeenCalled();
        expect(calculatorApp.bindEvents).toHaveBeenCalled();
    });
});