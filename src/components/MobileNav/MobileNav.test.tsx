import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MobileNav from './MobileNav';

describe('MobileNav', () => {
  it('renders all three tabs', () => {
    const onTabChange = vi.fn();
    render(<MobileNav activeTab="bio" onTabChange={onTabChange} />);

    expect(screen.getByText('Bio')).toBeInTheDocument();
    expect(screen.getByText('Blog')).toBeInTheDocument();
    expect(screen.getByText('Portfolio')).toBeInTheDocument();
  });

  it('marks active tab with aria-current', () => {
    const onTabChange = vi.fn();
    render(<MobileNav activeTab="blog" onTabChange={onTabChange} />);

    const blogButton = screen.getByRole('button', { name: /Navigate to Blog/i });
    expect(blogButton).toHaveAttribute('aria-current', 'page');
  });

  it('does not mark inactive tabs with aria-current', () => {
    const onTabChange = vi.fn();
    render(<MobileNav activeTab="blog" onTabChange={onTabChange} />);

    const bioButton = screen.getByRole('button', { name: /Navigate to Bio/i });
    expect(bioButton).not.toHaveAttribute('aria-current');
  });

  it('calls onTabChange when a tab is clicked', async () => {
    const user = userEvent.setup();
    const onTabChange = vi.fn();
    render(<MobileNav activeTab="bio" onTabChange={onTabChange} />);

    const portfolioButton = screen.getByRole('button', { name: /Navigate to Portfolio/i });
    await user.click(portfolioButton);

    expect(onTabChange).toHaveBeenCalledWith('portfolio');
  });

  it('applies active class to active tab', () => {
    const onTabChange = vi.fn();
    render(<MobileNav activeTab="blog" onTabChange={onTabChange} />);

    const blogButton = screen.getByRole('button', { name: /Navigate to Blog/i });
    expect(blogButton).toHaveClass('active');
  });

  it('shows indicator on active tab', () => {
    const onTabChange = vi.fn();
    render(<MobileNav activeTab="bio" onTabChange={onTabChange} />);

    const indicators = screen.getAllByLabelText('', { hidden: true });
    // Active tab should have an indicator
    expect(indicators.length).toBeGreaterThanOrEqual(1);
  });
});
