import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import axios from 'axios';
import LoginPage from './LoginPage';

jest.mock('axios');

describe('LoginPage', () => {
  it('renders login form', () => {
    render(<LoginPage />);
    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByLabelText('Email:')).toBeInTheDocument();
    expect(screen.getByLabelText('Password:')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Login/i })).toBeInTheDocument();
  });

  it('shows error message on unsuccessful login', async () => {
    axios.post.mockRejectedValueOnce({ response: { data: { success: false, message: 'Authentication failed.' } } });
    render(<LoginPage />);

    fireEvent.change(screen.getByLabelText('Email:'), { target: { value: 'user@example.com' } });
    fireEvent.change(screen.getByLabelText('Password:'), { target: { value: 'wrongpassword' } });
    fireEvent.click(screen.getByRole('button', { name: /Login/i }));

    const errorMessage = await screen.findByText('Authentication failed.');
    expect(errorMessage).toBeInTheDocument();
  });

  it('redirects on successful login', async () => {
    jest.spyOn(window.location, 'assign').mockImplementation(() => {});
    axios.post.mockResolvedValueOnce({ data: { success: true, token: 'fake-token' } });

    render(<LoginPage />);

    fireEvent.change(screen.getByLabelText('Email:'), { target: { value: 'user@example.com' } });
    fireEvent.change(screen.getByLabelText('Password:'), { target: { value: 'correctpassword' } });
    fireEvent.click(screen.getByRole('button', { name: /Login/i }));

    await screen.findByText('Login');
    expect(window.location.assign).toHaveBeenCalledWith('/dashboard');
  });
});