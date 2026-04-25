import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Hero } from './Hero';

describe('Hero', () => {
  const renderHero = () =>
    render(<MemoryRouter><Hero /></MemoryRouter>);

  it('renders free trial badge', () => {
    renderHero();
    expect(screen.getByText(/14 дней бесплатно/i)).toBeTruthy();
  });

  it('renders main heading', () => {
    renderHero();
    expect(screen.getByText(/Цифровое меню/i)).toBeTruthy();
  });

  it('renders register CTA', () => {
    renderHero();
    const links = screen.getAllByRole('link');
    const registerLink = links.find((l) => l.textContent?.includes('Начать бесплатно'));
    expect(registerLink).toBeTruthy();
    expect(registerLink?.getAttribute('href')).toBe('/register');
  });

  it('renders phone mockup section', () => {
    renderHero();
    expect(screen.getByText('Ristorante Milano')).toBeTruthy();
  });

  it('renders trust badges', () => {
    renderHero();
    expect(screen.getByText(/Без кредитной карты/i)).toBeTruthy();
  });
});
