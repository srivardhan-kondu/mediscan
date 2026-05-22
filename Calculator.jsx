import React, { useState } from 'react';

const Calculator = () => {
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');

  const handleInput = (e) => {
    setInput(e.target.value);
  };

  const calculateResult = () => {
    try {
      // Note: eval can be dangerous if input is not sanitized. Use with caution.
      const evalResult = eval(input); // eslint-disable-line no-eval
      setResult(evalResult);
    } catch (error) {
      setResult('Error');
    }
  };

  return (
    <div>
      <h2>Calculator</h2>
      <input type="text" value={input} onChange={handleInput} placeholder="Enter expression" />
      <button onClick={calculateResult}>Calculate</button>
      {result !== '' && <p>Result: {result}</p>}
    </div>
  );
};

export default Calculator;
