import React, { useState } from 'react';
import axios from 'axios';
import Calculator from './Calculator';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post('/api/auth/login', { email, password });
      if(response.data.success) {
        setIsLoggedIn(true);
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred while logging in.');
    }
  };

  if (isLoggedIn) {
    return <Calculator />;
  }

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email:</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <label>Password:</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <button type="submit">Login</button>
        {error && <p style={{color: 'red'}}>{error}</p>}
      </form>
    </div>
  );
};

export default LoginPage;
