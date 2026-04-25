import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Features } from './Features';

describe('Features', () => {
  it('renders section heading', () => {
    render(<Features />);
    expect(screen.getByText('Всё для удобного меню')).toBeTruthy();
  });

  it('renders all 6 feature cards', () => {
    render(<Features />);
    expect(screen.getByText('Мультиязычность')).toBeTruthy();
    expect(screen.getByText('QR-код для меню')).toBeTruthy();
    expect(screen.getByText('Адаптивный дизайн')).toBeTruthy();
    expect(screen.getByText('Быстрое управление')).toBeTruthy();
    expect(screen.getByText('Аналитика заказов')).toBeTruthy();
    expect(screen.getByText('Telegram бот')).toBeTruthy();
  });

  it('mentions узбекском in multilanguage description', () => {
    render(<Features />);
    expect(screen.getByText(/узбекском/i)).toBeTruthy();
  });
});
