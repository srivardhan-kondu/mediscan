import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import Calculator from './Calculator';

describe('Calculator Component', () => {
  it('renders calculator input and button', () => {
    render(<Calculator />);
    expect(screen.getByPlaceholderText(/enter expression/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /calculate/i })).toBeInTheDocument();
  });

  it('calculates correct result for a simple expression', () => {
    render(<Calculator />);
    fireEvent.change(screen.getByPlaceholderText(/enter expression/i), { target: { value: '2 + 3' } });
    fireEvent.click(screen.getByRole('button', { name: /calculate/i }));
    expect(screen.getByText('Result: 5')).toBeInTheDocument();
  });

  it('handles errors in the expression gracefully', () => {
    render(<Calculator />);
    fireEvent.change(screen.getByPlaceholderText(/enter expression/i), { target: { value: '2 /' } });
    fireEvent.click(screen.getByRole('button', { name: /calculate/i }));
    expect(screen.getByText('Result: Error')).toBeInTheDocument();
  });
});