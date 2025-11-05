import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useWindowStore } from '@stores/windowStore';
import Window from './Window';

describe('Window Component', () => {
  beforeEach(() => {
    // Reset store
    useWindowStore.setState({
      windows: {
        test: {
          id: 'test',
          position: { x: 50, y: 50 },
          size: { width: 400, height: 300 },
          isMinimized: false,
          isVisible: true,
        },
      },
      windowStack: ['test'],
    });
  });

  it('renders window with title and content', () => {
    render(
      <Window id="test" title="Test Window">
        <div>Test Content</div>
      </Window>
    );

    expect(screen.getByText('Test Window')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('does not render when window is not visible', () => {
    useWindowStore.setState({
      windows: {
        test: {
          id: 'test',
          position: { x: 50, y: 50 },
          size: { width: 400, height: 300 },
          isMinimized: false,
          isVisible: false,
        },
      },
      windowStack: [],
    });

    const { container } = render(
      <Window id="test" title="Test Window">
        <div>Test Content</div>
      </Window>
    );

    expect(container.firstChild).toBeNull();
  });

  it('renders minimize button when minimizable', () => {
    render(
      <Window id="test" title="Test Window" minimizable>
        <div>Content</div>
      </Window>
    );

    expect(screen.getByLabelText('Minimize')).toBeInTheDocument();
  });

  it('renders close button when closeable', () => {
    render(
      <Window id="test" title="Test Window" closeable>
        <div>Content</div>
      </Window>
    );

    expect(screen.getByLabelText('Close')).toBeInTheDocument();
  });

  it('minimizes window when minimize button clicked', async () => {
    const user = userEvent.setup();

    render(
      <Window id="test" title="Test Window" minimizable>
        <div>Content</div>
      </Window>
    );

    const minimizeButton = screen.getByLabelText('Minimize');
    await user.click(minimizeButton);

    const window = useWindowStore.getState().windows.test;
    expect(window.isMinimized).toBe(true);
  });

  it('closes window when close button clicked', async () => {
    const user = userEvent.setup();

    render(
      <Window id="test" title="Test Window" closeable>
        <div>Content</div>
      </Window>
    );

    const closeButton = screen.getByLabelText('Close');
    await user.click(closeButton);

    const window = useWindowStore.getState().windows.test;
    expect(window.isVisible).toBe(false);
  });

  it('brings window to front when clicked', async () => {
    const user = userEvent.setup();

    // Add another window to the stack
    useWindowStore.setState({
      windows: {
        test: {
          id: 'test',
          position: { x: 50, y: 50 },
          size: { width: 400, height: 300 },
          isMinimized: false,
          isVisible: true,
        },
        other: {
          id: 'other',
          position: { x: 100, y: 100 },
          size: { width: 400, height: 300 },
          isMinimized: false,
          isVisible: true,
        },
      },
      windowStack: ['test', 'other'],
    });

    render(
      <Window id="test" title="Test Window">
        <div>Content</div>
      </Window>
    );

    const windowElement = screen.getByText('Test Window').closest('div')?.parentElement;
    if (windowElement) {
      await user.click(windowElement);
    }

    const stack = useWindowStore.getState().windowStack;
    expect(stack[stack.length - 1]).toBe('test');
  });
});
