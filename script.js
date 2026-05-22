document.addEventListener('DOMContentLoaded', () => {
    const display = document.getElementById('display');

    function handleInput(value) {
        if (isValidInput(value)) {
            display.value += value;
        }
    }

    function handleClear() {
        display.value = '';
    }

    function handleDelete() {
        display.value = display.value.slice(0, -1);
    }

    function handleCalculate() {
        try {
            if (display.value) {
                const result = eval(display.value);
                display.value = result;
            }
        } catch (error) {
            display.value = 'Invalid Expression';
        }
    }

    function isValidInput(value) {
        const lastChar = display.value.slice(-1);
        const operators = ['+', '-', '*', '/'];
        if (operators.includes(value) && operators.includes(lastChar)) {
            return false;
        }
        return true;
    }

    window.handleInput = handleInput;
    window.handleClear = handleClear;
    window.handleDelete = handleDelete;
    window.handleCalculate = handleCalculate;
});