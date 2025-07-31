import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders chronicler app', () => {
  render(<App />);
  const headingElement = screen.getByText(/chronicler/i);
  expect(headingElement).toBeInTheDocument();
});

test('renders upload instructions', () => {
  render(<App />);
  const instructionsElement = screen.getByText(/upload your text file/i);
  expect(instructionsElement).toBeInTheDocument();
});
