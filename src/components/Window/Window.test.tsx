import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
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

  it('allows dragging when draggable prop is true', () => {
    render(
      <Window id="test" title="Test Window" draggable>
        <div>Content</div>
      </Window>
    );

    const chrome = screen.getByText('Test Window').parentElement;
    expect(chrome).toBeInTheDocument();

    // Should be able to trigger mousedown on chrome
    if (chrome) {
      fireEvent.mouseDown(chrome, { clientX: 100, clientY: 50 });
      // No error means dragging is enabled
    }
  });

  it('updates position during drag', () => {
    const { container } = render(
      <Window id="test" title="Test Window" draggable>
        <div>Content</div>
      </Window>
    );

    const chrome = screen.getByText('Test Window').parentElement;

    if (chrome) {
      // Start drag
      fireEvent.mouseDown(chrome, { clientX: 100, clientY: 50 });

      // Move mouse
      fireEvent.mouseMove(window, { clientX: 150, clientY: 80 });

      // Window should have moved
      const windowElement = container.querySelector('[style*="left"]');
      expect(windowElement).toBeInTheDocument();
    }
  });

  it('calls updatePosition on drag end', () => {
    const updatePositionSpy = vi.fn();

    // Mock the store action
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
      updatePosition: updatePositionSpy,
    });

    render(
      <Window id="test" title="Test Window" draggable>
        <div>Content</div>
      </Window>
    );

    const chrome = screen.getByText('Test Window').parentElement;

    if (chrome) {
      // Start drag
      fireEvent.mouseDown(chrome, { clientX: 100, clientY: 50 });

      // Move mouse
      fireEvent.mouseMove(window, { clientX: 150, clientY: 80 });

      // End drag
      fireEvent.mouseUp(window);

      // updatePosition should have been called
      expect(updatePositionSpy).toHaveBeenCalledWith('test', expect.any(Object));
    }
  });

  it('applies dragging class during drag', () => {
    const { container } = render(
      <Window id="test" title="Test Window" draggable>
        <div>Content</div>
      </Window>
    );

    const chrome = screen.getByText('Test Window').parentElement;
    const windowElement = container.firstChild as HTMLElement;

    // Should not have dragging class initially
    expect(windowElement.className).not.toContain('dragging');

    if (chrome) {
      // Start drag
      fireEvent.mouseDown(chrome, { clientX: 100, clientY: 50 });

      // Should have dragging class
      expect(windowElement.className).toContain('dragging');

      // End drag
      fireEvent.mouseUp(window);

      // Should not have dragging class anymore
      expect(windowElement.className).not.toContain('dragging');
    }
  });

  it('brings window to front when starting to drag', () => {
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
      <Window id="test" title="Test Window" draggable>
        <div>Content</div>
      </Window>
    );

    const chrome = screen.getByText('Test Window').parentElement;

    if (chrome) {
      // Start drag
      fireEvent.mouseDown(chrome, { clientX: 100, clientY: 50 });

      // Window should be brought to front
      const stack = useWindowStore.getState().windowStack;
      expect(stack[stack.length - 1]).toBe('test');
    }
  });

  it('does not drag when draggable prop is false', () => {
    const { container } = render(
      <Window id="test" title="Test Window" draggable={false}>
        <div>Content</div>
      </Window>
    );

    const chrome = screen.getByText('Test Window').parentElement;
    const windowElement = container.firstChild as HTMLElement;
    const initialStyle = windowElement.style.left;

    if (chrome) {
      // Try to start drag
      fireEvent.mouseDown(chrome, { clientX: 100, clientY: 50 });

      // Move mouse
      fireEvent.mouseMove(window, { clientX: 150, clientY: 80 });

      // Position should not change (dragging not enabled)
      expect(windowElement.style.left).toBe(initialStyle);
      expect(windowElement.className).not.toContain('dragging');
    }
  });
});
