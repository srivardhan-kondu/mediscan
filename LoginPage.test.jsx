import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import axios from 'axios';
import LoginPage from './LoginPage';

jest.mock('axios');

describe('LoginPage Component', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders login form correctly', () => {
    render(<LoginPage />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  it('displays error when login fails due to wrong credentials', async () => {
    axios.post.mockRejectedValue({
      response: { data: { success: false, message: 'Authentication failed. Wrong credentials.' } }
    });

    render(<LoginPage />);

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'wrongpassword' } });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    expect(await screen.findByText(/Authentication failed. Wrong credentials./i)).toBeInTheDocument();
  });

  it('navigates to Calculator on successful login', async () => {
    axios.post.mockResolvedValue({ data: { success: true } });

    render(<LoginPage />);

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'correctpassword' } });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    expect(await screen.findByText(/Calculator/i)).toBeInTheDocument();
  });
});