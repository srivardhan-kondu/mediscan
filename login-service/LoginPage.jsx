import React, { useState } from 'react';

/**
 * React component representing the Login Page.
 * @returns {JSX.Element} The rendered login page component.
 */
export const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  /**
   * Handles form submission event.
   * Validates input before sending a request to the server.
   * @param {React.FormEvent} event - The form submission event.
   */
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!username || !password) {
      setError('Username and password are required.');
      return;
    }

    try {
      const response = await fetch('/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'An error occurred while logging in.');
      } else {
        alert(data.message);
      }
    } catch (err) {
      setError('Failed to login. Please try again later.');
      console.error('Login error:', err);
    }
  };

  return (
    <div>
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="username">Username:</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export { handleSubmit };