import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ErrorBoundary } from './ErrorBoundary';

const ThrowComponent = () => {
  throw new Error('Test error');
};

describe('ErrorBoundary', () => {
  const originalError = console.error;

  beforeEach(() => {
    console.error = vi.fn();
  });

  afterEach(() => {
    console.error = originalError;
  });

  it('should render children when no error', () => {
    const { container } = render(
      <ErrorBoundary>
        <div>Test content</div>
      </ErrorBoundary>
    );

    expect(container.textContent).toContain('Test content');
  });

  it('should render error fallback when child component throws', () => {
    render(
      <ErrorBoundary>
        <ThrowComponent />
      </ErrorBoundary>
    );

    const heading = screen.getByText(/something went wrong/i);
    expect(heading).toBeTruthy();
  });

  it('should show error details in collapsed details element', () => {
    render(
      <ErrorBoundary>
        <ThrowComponent />
      </ErrorBoundary>
    );

    const detailsElement = screen.getByText(/error details/i);
    expect(detailsElement).toBeTruthy();
  });

  it('should have reload button', () => {
    render(
      <ErrorBoundary>
        <ThrowComponent />
      </ErrorBoundary>
    );

    const button = screen.getByText(/reload page/i);
    expect(button).toBeTruthy();
    expect(button.tagName.toLowerCase()).toBe('button');
  });
});
