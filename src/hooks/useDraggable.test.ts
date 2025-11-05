import { renderHook, act } from '@testing-library/react';
import { useDraggable } from './useDraggable';

describe('useDraggable', () => {
  beforeEach(() => {
    // Mock window dimensions
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 768,
    });

    // Clean up cursor class from previous tests
    document.body.classList.remove('cursor-grabbing');
  });

  it('should initialize with the provided position', () => {
    const { result } = renderHook(() =>
      useDraggable({
        initialPosition: { x: 100, y: 50 },
      })
    );

    expect(result.current.position).toEqual({ x: 100, y: 50 });
    expect(result.current.isDragging).toBe(false);
  });

  it('should set isDragging to true on mouse down', () => {
    const { result } = renderHook(() =>
      useDraggable({
        initialPosition: { x: 0, y: 0 },
      })
    );

    const mockEvent = {
      preventDefault: vi.fn(),
      clientX: 100,
      clientY: 50,
    } as unknown as React.MouseEvent;

    act(() => {
      result.current.handleMouseDown(mockEvent);
    });

    expect(result.current.isDragging).toBe(true);
    expect(mockEvent.preventDefault).toHaveBeenCalled();
  });

  it('should update position during drag', () => {
    const { result } = renderHook(() =>
      useDraggable({
        initialPosition: { x: 100, y: 100 },
      })
    );

    // Start drag
    const mouseDownEvent = {
      preventDefault: vi.fn(),
      clientX: 100,
      clientY: 100,
    } as unknown as React.MouseEvent;

    act(() => {
      result.current.handleMouseDown(mouseDownEvent);
    });

    // Simulate mouse move
    const mouseMoveEvent = new MouseEvent('mousemove', {
      clientX: 150,
      clientY: 130,
    });

    act(() => {
      window.dispatchEvent(mouseMoveEvent);
    });

    expect(result.current.position).toEqual({ x: 150, y: 130 });
  });

  it('should call onDrag callback during drag', () => {
    const onDrag = vi.fn();
    const { result } = renderHook(() =>
      useDraggable({
        initialPosition: { x: 100, y: 100 },
        onDrag,
      })
    );

    // Start drag
    act(() => {
      result.current.handleMouseDown({
        preventDefault: vi.fn(),
        clientX: 100,
        clientY: 100,
      } as unknown as React.MouseEvent);
    });

    // Mouse move
    act(() => {
      window.dispatchEvent(
        new MouseEvent('mousemove', { clientX: 150, clientY: 130 })
      );
    });

    expect(onDrag).toHaveBeenCalledWith({ x: 150, y: 130 });
  });

  it('should call onDragEnd callback on mouse up', () => {
    const onDragEnd = vi.fn();
    const { result } = renderHook(() =>
      useDraggable({
        initialPosition: { x: 100, y: 100 },
        onDragEnd,
      })
    );

    // Start drag
    act(() => {
      result.current.handleMouseDown({
        preventDefault: vi.fn(),
        clientX: 100,
        clientY: 100,
      } as unknown as React.MouseEvent);
    });

    // Mouse move
    act(() => {
      window.dispatchEvent(
        new MouseEvent('mousemove', { clientX: 150, clientY: 130 })
      );
    });

    // Mouse up
    act(() => {
      window.dispatchEvent(new MouseEvent('mouseup'));
    });

    expect(result.current.isDragging).toBe(false);
    expect(onDragEnd).toHaveBeenCalledWith({ x: 150, y: 130 });
  });

  it('should constrain position to viewport when enabled', () => {
    const { result } = renderHook(() =>
      useDraggable({
        initialPosition: { x: 100, y: 100 },
        constrainToViewport: true,
        windowSize: { width: 400, height: 300 },
      })
    );

    // Start drag
    act(() => {
      result.current.handleMouseDown({
        preventDefault: vi.fn(),
        clientX: 100,
        clientY: 100,
      } as unknown as React.MouseEvent);
    });

    // Try to move beyond right edge
    act(() => {
      window.dispatchEvent(
        new MouseEvent('mousemove', { clientX: 2000, clientY: 100 })
      );
    });

    // Should be constrained to maxX (window.innerWidth - 40)
    expect(result.current.position.x).toBe(984); // 1024 - 40
  });

  it('should allow negative x when window is partially off-screen', () => {
    const { result } = renderHook(() =>
      useDraggable({
        initialPosition: { x: 100, y: 100 },
        constrainToViewport: true,
        windowSize: { width: 400, height: 300 },
      })
    );

    // Start drag
    act(() => {
      result.current.handleMouseDown({
        preventDefault: vi.fn(),
        clientX: 100,
        clientY: 100,
      } as unknown as React.MouseEvent);
    });

    // Try to move far left
    act(() => {
      window.dispatchEvent(
        new MouseEvent('mousemove', { clientX: -500, clientY: 100 })
      );
    });

    // Should be constrained to minX (-(windowSize.width - 40))
    expect(result.current.position.x).toBe(-360); // -(400 - 40)
  });

  it('should prevent y from going negative', () => {
    const { result } = renderHook(() =>
      useDraggable({
        initialPosition: { x: 100, y: 100 },
        constrainToViewport: true,
        windowSize: { width: 400, height: 300 },
      })
    );

    // Start drag
    act(() => {
      result.current.handleMouseDown({
        preventDefault: vi.fn(),
        clientX: 100,
        clientY: 100,
      } as unknown as React.MouseEvent);
    });

    // Try to move above viewport
    act(() => {
      window.dispatchEvent(
        new MouseEvent('mousemove', { clientX: 100, clientY: -50 })
      );
    });

    // Should be constrained to minY (0)
    expect(result.current.position.y).toBe(0);
  });

  it('should not constrain position when disabled', () => {
    const { result } = renderHook(() =>
      useDraggable({
        initialPosition: { x: 100, y: 100 },
        constrainToViewport: false,
      })
    );

    // Start drag
    act(() => {
      result.current.handleMouseDown({
        preventDefault: vi.fn(),
        clientX: 100,
        clientY: 100,
      } as unknown as React.MouseEvent);
    });

    // Move far beyond viewport
    act(() => {
      window.dispatchEvent(
        new MouseEvent('mousemove', { clientX: 2000, clientY: -100 })
      );
    });

    // Should not be constrained
    expect(result.current.position).toEqual({ x: 2000, y: -100 });
  });

  it('should update position when initialPosition changes', () => {
    const { result, rerender } = renderHook(
      ({ pos }) => useDraggable({ initialPosition: pos }),
      {
        initialProps: { pos: { x: 100, y: 100 } },
      }
    );

    expect(result.current.position).toEqual({ x: 100, y: 100 });

    // Update initial position
    rerender({ pos: { x: 200, y: 150 } });

    expect(result.current.position).toEqual({ x: 200, y: 150 });
  });

  it('should reapply constraints on window resize', () => {
    const { result } = renderHook(() =>
      useDraggable({
        initialPosition: { x: 900, y: 100 },
        constrainToViewport: true,
        windowSize: { width: 400, height: 300 },
      })
    );

    expect(result.current.position).toEqual({ x: 900, y: 100 });

    // Resize window to be smaller
    act(() => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 800,
      });
      window.dispatchEvent(new Event('resize'));
    });

    // Position should be constrained to new viewport
    expect(result.current.position.x).toBe(760); // 800 - 40
  });

  it('should add and remove cursor-grabbing class', () => {
    const { result } = renderHook(() =>
      useDraggable({
        initialPosition: { x: 100, y: 100 },
      })
    );

    expect(document.body.classList.contains('cursor-grabbing')).toBe(false);

    // Start drag
    act(() => {
      result.current.handleMouseDown({
        preventDefault: vi.fn(),
        clientX: 100,
        clientY: 100,
      } as unknown as React.MouseEvent);
    });

    expect(document.body.classList.contains('cursor-grabbing')).toBe(true);

    // End drag
    act(() => {
      window.dispatchEvent(new MouseEvent('mouseup'));
    });

    expect(document.body.classList.contains('cursor-grabbing')).toBe(false);
  });

  it('should clean up event listeners on unmount', () => {
    const { result, unmount } = renderHook(() =>
      useDraggable({
        initialPosition: { x: 100, y: 100 },
      })
    );

    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

    // Start drag
    act(() => {
      result.current.handleMouseDown({
        preventDefault: vi.fn(),
        clientX: 100,
        clientY: 100,
      } as unknown as React.MouseEvent);
    });

    // Unmount while dragging
    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'mousemove',
      expect.any(Function)
    );
    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'mouseup',
      expect.any(Function)
    );

    removeEventListenerSpy.mockRestore();
  });
});
