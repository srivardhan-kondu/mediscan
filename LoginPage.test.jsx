import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { LoginPage } from './LoginPage';

describe('LoginPage', () => {
  it('renders the login form', () => {
    render(<LoginPage />);
    expect(screen.getByText(/Email:/i)).toBeInTheDocument();
    expect(screen.getByText(/Password:/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });
});