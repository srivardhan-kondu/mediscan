import React, { useState } from 'react';
import axios from 'axios';

/**
 * LoginPage component rendering the login form with form validation.
 */
export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    try {
      const response = await axios.post('/login', {
        email,
        password
      });
      alert('Login successful');
    } catch (err) {
      setError('Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="login-page">
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p className="error">{error}</p>}
        <button type="submit">Login</button>
      </form>
    </div>
  );
}
