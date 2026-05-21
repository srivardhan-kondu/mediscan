(function() {
    "use strict";
    
    const calculatorApp = {
        init() {
            this.cacheDom();
            this.bindEvents();
        },

        cacheDom() {
            this.result = document.getElementById('result');
            this.num1 = document.getElementById('num1');
            this.num2 = document.getElementById('num2');
            this.buttons = {
                add: document.getElementById('add'),
                subtract: document.getElementById('subtract'),
                multiply: document.getElementById('multiply'),
                divide: document.getElementById('divide')
            };
        },

        bindEvents() {
            this.buttons.add.addEventListener('click', this.addNumbers.bind(this));
            this.buttons.subtract.addEventListener('click', this.subtractNumbers.bind(this));
            this.buttons.multiply.addEventListener('click', this.multiplyNumbers.bind(this));
            this.buttons.divide.addEventListener('click', this.divideNumbers.bind(this));
        },

        addNumbers() {
            const num1 = parseFloat(this.num1.value);
            const num2 = parseFloat(this.num2.value);
            this.result.textContent = num1 + num2;
        },

        subtractNumbers() {
            const num1 = parseFloat(this.num1.value);
            const num2 = parseFloat(this.num2.value);
            this.result.textContent = num1 - num2;
        },

        multiplyNumbers() {
            const num1 = parseFloat(this.num1.value);
            const num2 = parseFloat(this.num2.value);
            this.result.textContent = num1 * num2;
        },

        divideNumbers() {
            const num1 = parseFloat(this.num1.value);
            const num2 = parseFloat(this.num2.value);
            if(num2 === 0) {
                this.result.textContent = 'Error: Division by zero';
            } else {
                this.result.textContent = num1 / num2;
            }
        }
    };

    calculatorApp.init();
})();