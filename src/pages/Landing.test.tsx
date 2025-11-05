import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Landing from './Landing';

describe('Landing Page', () => {
  it('renders without crashing', () => {
    render(<Landing />);
    expect(screen.getByText(/Landing Page/i)).toBeInTheDocument();
  });

  it('displays OS-Brutalist description', () => {
    render(<Landing />);
    expect(screen.getByText(/OS-Brutalist Personal Site/i)).toBeInTheDocument();
  });
});
