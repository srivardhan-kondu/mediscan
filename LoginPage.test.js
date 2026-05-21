import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { LoginForm } from './LoginPage';

// Mock function to simulate login callback
const mockOnLogin = jest.fn();

describe('LoginForm Component', () => {
    beforeEach(() => {
        render(<LoginForm onLogin={mockOnLogin} />);
    });

    test('renders form fields and submit button', () => {
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
    });

    test('displays error when fields are empty on submit', () => {
        fireEvent.click(screen.getByRole('button', { name: /login/i }));
        expect(screen.getByText(/email and password are required/i)).toBeInTheDocument();
    });

    test('calls onLogin with email and password when form is valid', () => {
        fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'user@example.com' } });
        fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
        fireEvent.click(screen.getByRole('button', { name: /login/i }));

        expect(mockOnLogin).toHaveBeenCalledWith('user@example.com', 'password123');
        expect(mockOnLogin).toHaveBeenCalledTimes(1);
    });

    test('does not show error when inputs are filled', () => {
        fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'user@example.com' } });
        fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });

        fireEvent.click(screen.getByRole('button', { name: /login/i }));

        expect(screen.queryByText(/email and password are required/i)).not.toBeInTheDocument();
    });
});