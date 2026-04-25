import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { CTA } from './CTA';

describe('CTA', () => {
  const renderCTA = () =>
    render(<MemoryRouter><CTA /></MemoryRouter>);

  it('renders heading', () => {
    renderCTA();
    expect(screen.getByText('Готовы начать?')).toBeTruthy();
  });

  it('renders register link', () => {
    renderCTA();
    const link = screen.getByRole('link');
    expect(link.getAttribute('href')).toBe('/register');
    expect(link.textContent).toContain('Создать аккаунт бесплатно');
  });
});
