import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { LoginPage } from './LoginPage';

// Mock the fetch function
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ message: 'Login successful' }),
  })
);

describe('LoginPage', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  it('renders login form', () => {
    render(<LoginPage />);
    expect(screen.getByText(/Login/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByText(/Login/i, { selector: 'button' })).toBeInTheDocument();
  });

  it('shows error when username or password is missing', async () => {
    render(<LoginPage />);
    fireEvent.click(screen.getByText(/Login/i, { selector: 'button' }));
    expect(screen.getByText('Username and password are required.')).toBeInTheDocument();
  });

  it('sends login request to server and handles successful response', async () => {
    render(<LoginPage />);
    fireEvent.change(screen.getByLabelText(/Username/i), {
      target: { value: 'user' },
    });
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: 'pass' },
    });
    fireEvent.click(screen.getByText(/Login/i, { selector: 'button' }));

    expect(fetch).toHaveBeenCalledWith('/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username: 'user', password: 'pass' }),
    });

    await screen.findByText('Login successful');
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('handles server error response', async () => {
    fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ error: 'Invalid input' }),
      })
    );

    render(<LoginPage />);
    fireEvent.change(screen.getByLabelText(/Username/i), {
      target: { value: 'user' },
    });
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: 'pass' },
    });
    fireEvent.click(screen.getByText(/Login/i, { selector: 'button' }));

    await screen.findByText('Invalid input');
    expect(screen.getByText('Invalid input')).toBeInTheDocument();
  });
});