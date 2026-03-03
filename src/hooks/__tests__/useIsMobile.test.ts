import { renderHook, act } from '@testing-library/react';
import useIsMobile from '../useIsMobile';

describe('useIsMobile', () => {
    // Helper to set window width
    const setWindowWidth = (width: number) => {
        Object.defineProperty(window, 'innerWidth', {
            writable: true,
            configurable: true,
            value: width,
        });
    };

    beforeEach(() => {
        // Reset window width before each test
        setWindowWidth(1024);
    });

    it('should return false for desktop width', () => {
        setWindowWidth(1200);
        const { result } = renderHook(() => useIsMobile());
        expect(result.current).toBe(false);
    });

    it('should return true for mobile width', () => {
        setWindowWidth(768);
        const { result } = renderHook(() => useIsMobile());
        expect(result.current).toBe(true);
    });

    it('should use default breakpoint of 996', () => {
        setWindowWidth(995);
        const { result } = renderHook(() => useIsMobile());
        expect(result.current).toBe(true);

        setWindowWidth(997);
        const { result: result2 } = renderHook(() => useIsMobile());
        expect(result2.current).toBe(false);
    });

    it('should use custom breakpoint when provided', () => {
        setWindowWidth(800);
        const { result } = renderHook(() => useIsMobile(600));
        expect(result.current).toBe(false); // 800 >= 600

        const { result: result2 } = renderHook(() => useIsMobile(1000));
        expect(result2.current).toBe(true); // 800 < 1000
    });

    it('should respond to window resize events', () => {
        setWindowWidth(1200);
        const { result } = renderHook(() => useIsMobile());
        expect(result.current).toBe(false);

        // Simulate resize to mobile
        act(() => {
            setWindowWidth(500);
            window.dispatchEvent(new Event('resize'));
        });

        expect(result.current).toBe(true);
    });

    it('should clean up event listener on unmount', () => {
        const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');
        const { unmount } = renderHook(() => useIsMobile());

        unmount();

        expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));
        removeEventListenerSpy.mockRestore();
    });
});
