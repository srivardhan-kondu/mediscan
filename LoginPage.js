// LoginPage.js - React component for login page
import React, { useState } from 'react';

// LoginForm component handles the structure and logic of the login form
export function LoginForm({ onLogin }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    /**
     * Validates the form inputs
     * @returns {boolean} True if form is valid, otherwise false
     */
    const validateForm = () => {
        if (!email || !password) {
            setError('Email and password are required.');
            return false;
        }
        setError('');
        return true;
    };

    /**
     * Handles form submission
     * @param {Event} e - Form submit event
     */
    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
            onLogin(email, password);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label>Email:</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
                <label>Password:</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            {error && <div className="error">{error}</div>}
            <LoginButton />
        </form>
    );
}

// LoginButton component renders the login button
export function LoginButton() {
    return <button type="submit">Login</button>;
}

// Responsive design styles
const style = {
    form: {
        maxWidth: '400px',
        margin: '0 auto',
        padding: '1rem',
        border: '1px solid #ccc',
        borderRadius: '5px',
    },
    input: {
        width: '100%',
        padding: '0.5rem',
        marginBottom: '0.5rem',
    },
    error: {
        color: 'red',
    }
};