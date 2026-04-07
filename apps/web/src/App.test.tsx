import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{children}</MemoryRouter>
    </QueryClientProvider>
  );
}

describe('App', () => {
  it('renders without crashing', () => {
    const { container } = render(<App />, { wrapper: Wrapper });
    expect(container).toBeTruthy();
  });

  it('renders layout with routes', () => {
    const { container } = render(<App />, { wrapper: Wrapper });
    expect(container.querySelector('.min-h-screen')).toBeTruthy();
  });
});
