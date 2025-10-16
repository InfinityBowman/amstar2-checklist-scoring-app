import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@solidjs/testing-library';
import StrengthIndicator from '@auth/StrengthIndicator';

describe('StrengthIndicator', () => {
  test('should render all password requirements', () => {
    render(() => <StrengthIndicator password="" onUnmet={() => {}} />);

    expect(screen.getByText('At least 8 characters')).toBeTruthy();
    expect(screen.getByText('Uppercase letter (A-Z)')).toBeTruthy();
    expect(screen.getByText('Lowercase letter (a-z)')).toBeTruthy();
    expect(screen.getByText('Number (0-9)')).toBeTruthy();
    expect(screen.getByText('Special character (e.g. !?<>@#$%)')).toBeTruthy();
  });

  test('should mark all requirements as unmet for empty password', () => {
    const { container } = render(() => <StrengthIndicator password="" onUnmet={() => {}} />);

    const redElements = container.querySelectorAll('.text-red-500');
    const greenElements = container.querySelectorAll('.text-green-500');

    expect(redElements.length).toBe(10); // 5 requirements x 2 (text + icon)
    expect(greenElements.length).toBe(0);
  });

  test('should mark requirements as met when password meets criteria', () => {
    const { container } = render(() => <StrengthIndicator password="Password1!" onUnmet={() => {}} />);

    const redElements = container.querySelectorAll('.text-red-500');
    const greenElements = container.querySelectorAll('.text-green-500');

    expect(redElements.length).toBe(0);
    expect(greenElements.length).toBe(10); // 5 requirements x 2 (text + icon)
  });

  test('should call onUnmet callback with correct errors', () => {
    const mockOnUnmet = vi.fn();
    render(() => <StrengthIndicator password="password" onUnmet={mockOnUnmet} />);

    expect(mockOnUnmet).toHaveBeenCalled();
    const calledArgs = mockOnUnmet.mock.calls[0][0];

    expect(calledArgs).toContain('an uppercase letter');
    expect(calledArgs).toContain('a number');
    expect(calledArgs).toContain('a special character');
    expect(calledArgs).not.toContain('at least 8 characters');
    expect(calledArgs).not.toContain('a lowercase letter');
  });

  test('should handle different password combinations correctly', () => {
    // 1. Only length requirement met
    const { unmount } = render(() => <StrengthIndicator password="passwordpassword" onUnmet={() => {}} />);
    const lengthMet = screen.getByText('At least 8 characters');
    expect(lengthMet).toHaveClass('text-green-500');

    // Check other requirements are not met
    expect(screen.getByText('Uppercase letter (A-Z)')).toHaveClass('text-red-500');
    expect(screen.getByText('Number (0-9)')).toHaveClass('text-red-500');
    expect(screen.getByText('Special character (e.g. !?<>@#$%)')).toHaveClass('text-red-500');

    unmount();

    // 2. Only uppercase requirement met
    render(() => <StrengthIndicator password="P" onUnmet={() => {}} />);
    const upperMet = screen.getByText('Uppercase letter (A-Z)');
    expect(upperMet).toHaveClass('text-green-500');

    // Check other requirements are not met
    expect(screen.getByText('At least 8 characters')).toHaveClass('text-red-500');
    expect(screen.getByText('Number (0-9)')).toHaveClass('text-red-500');
    expect(screen.getByText('Special character (e.g. !?<>@#$%)')).toHaveClass('text-red-500');
  });
});
