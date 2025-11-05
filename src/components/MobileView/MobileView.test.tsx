import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MobileView from './MobileView';

describe('MobileView', () => {
  const mockContent = {
    bio: <div>Bio Content</div>,
    blog: <div>Blog Content</div>,
    portfolio: <div>Portfolio Content</div>,
  };

  it('renders all three content sections', () => {
    render(<MobileView>{mockContent}</MobileView>);

    expect(screen.getByText('Bio Content')).toBeInTheDocument();
    expect(screen.getByText('Blog Content')).toBeInTheDocument();
    expect(screen.getByText('Portfolio Content')).toBeInTheDocument();
  });

  it('shows bio content by default', () => {
    render(<MobileView>{mockContent}</MobileView>);

    const bioSection = screen.getByText('Bio Content').closest('div');
    expect(bioSection).toHaveClass('active');
  });

  it('switches to blog content when blog tab is clicked', async () => {
    const user = userEvent.setup();
    render(<MobileView>{mockContent}</MobileView>);

    const blogButton = screen.getByRole('button', { name: /Navigate to Blog/i });
    await user.click(blogButton);

    const blogSection = screen.getByText('Blog Content').closest('div');
    expect(blogSection).toHaveClass('active');
  });

  it('switches to portfolio content when portfolio tab is clicked', async () => {
    const user = userEvent.setup();
    render(<MobileView>{mockContent}</MobileView>);

    const portfolioButton = screen.getByRole('button', { name: /Navigate to Portfolio/i });
    await user.click(portfolioButton);

    const portfolioSection = screen.getByText('Portfolio Content').closest('div');
    expect(portfolioSection).toHaveClass('active');
  });

  it('hides inactive sections with aria-hidden', () => {
    render(<MobileView>{mockContent}</MobileView>);

    const blogSection = screen.getByText('Blog Content').closest('div');
    const portfolioSection = screen.getByText('Portfolio Content').closest('div');

    expect(blogSection).toHaveAttribute('aria-hidden', 'true');
    expect(portfolioSection).toHaveAttribute('aria-hidden', 'true');
  });

  it('renders mobile navigation', () => {
    render(<MobileView>{mockContent}</MobileView>);

    expect(screen.getByRole('navigation', { name: /Main navigation/i })).toBeInTheDocument();
  });
});
