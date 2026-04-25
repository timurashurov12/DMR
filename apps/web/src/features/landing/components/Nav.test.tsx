import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Nav } from './Nav';

describe('Nav', () => {
  const renderNav = () =>
    render(<MemoryRouter><Nav /></MemoryRouter>);

  it('renders logo text', () => {
    renderNav();
    expect(screen.getByText('DMR')).toBeTruthy();
  });

  it('renders navigation links', () => {
    renderNav();
    expect(screen.getByText('Тарифы')).toBeTruthy();
    expect(screen.getByText('Возможности')).toBeTruthy();
    expect(screen.getByText('FAQ')).toBeTruthy();
  });

  it('renders login and register buttons', () => {
    renderNav();
    expect(screen.getByText('Войти')).toBeTruthy();
    expect(screen.getByText('Начать бесплатно')).toBeTruthy();
  });
});
