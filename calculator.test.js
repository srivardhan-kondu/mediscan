import { handleInput, handleClear, handleDelete, handleCalculate } from './script';

describe('Calculator Functions Unit Tests', () => {
    let display;

    beforeEach(() => {
        display = { value: '' };
    });

    test('handleInput appends number correctly', () => {
        handleInput.call({ display }, '3');
        expect(display.value).toBe('3');
    });

    test('handleClear clears the display', () => {
        display.value = '123';
        handleClear.call({ display });
        expect(display.value).toBe('');
    });

    test('handleDelete removes last character', () => {
        display.value = '123';
        handleDelete.call({ display });
        expect(display.value).toBe('12');
    });

    test('handleInput does not allow consecutive operators', () => {
        display.value = '5+';
        handleInput.call({ display }, '+');
        expect(display.value).toBe('5+');
    });

    test('handleCalculate evaluates expression correctly', () => {
        display.value = '2+2';
        handleCalculate.call({ display });
        expect(display.value).toBe('4');
    });

    test('handleCalculate returns error for invalid expression', () => {
        display.value = '2++2';
        handleCalculate.call({ display });
        expect(display.value).toBe('Invalid Expression');
    });
});

describe('Calculator Integration Tests', () => {
    let display;

    beforeEach(() => {
        display = { value: '' };
    });

    test('Complete calculation scenario test', () => {
        handleInput.call({ display }, '6');
        handleInput.call({ display }, '*');
        handleInput.call({ display }, '7');
        handleCalculate.call({ display });
        expect(display.value).toBe('42');
    });

    test('Edge case: Leading zero removal in calculation', () => {
        display.value = '0040/2';
        handleCalculate.call({ display });
        expect(display.value).toBe('20');
    });
});