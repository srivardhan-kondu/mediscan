document.addEventListener('DOMContentLoaded', function () {
    const calculator = document.querySelector('.calculator');
    const keys = calculator.querySelector('.calculator-keys');
    const display = calculator.querySelector('.calculator-screen');

    let firstValue = '';
    let operator = '';
    let shouldResetDisplay = false;

    keys.addEventListener('click', function (event) {
        const { target } = event;
        if (!target.matches('button')) return;

        const { value } = target;

        if (target.classList.contains('operator')) {
            if (firstValue && operator && !shouldResetDisplay) {
                display.value = calculate(firstValue, operator, display.value);
                firstValue = display.value;
            } else {
                firstValue = display.value;
            }
            operator = value;
            shouldResetDisplay = true;
            return;
        }

        if (value === 'all-clear') {
            firstValue = '';
            operator = '';
            display.value = '0';
            shouldResetDisplay = false;
            return;
        }

        if (value === '=') {
            if (firstValue) {
                display.value = calculate(firstValue, operator, display.value);
                firstValue = '';
                operator = '';
            }
            return;
        }

        if (shouldResetDisplay) {
            display.value = value;
            shouldResetDisplay = false;
        } else {
            display.value = display.value === '0' ? value : display.value + value;
        }
    });

    const calculate = (n1, operator, n2) => {
        let result = '';
        if (operator === '+') result = parseFloat(n1) + parseFloat(n2);
        if (operator === '-') result = parseFloat(n1) - parseFloat(n2);
        if (operator === '*') result = parseFloat(n1) * parseFloat(n2);
        if (operator === '/') result = parseFloat(n1) / parseFloat(n2);
        return result.toString();
    };
});