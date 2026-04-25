import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Steps } from './Steps';

describe('Steps', () => {
  it('renders heading', () => {
    render(<Steps />);
    expect(screen.getByText('3 простых шага')).toBeTruthy();
  });

  it('renders all 3 step titles', () => {
    render(<Steps />);
    expect(screen.getByText('Регистрация')).toBeTruthy();
    expect(screen.getByText('Создание меню')).toBeTruthy();
    expect(screen.getByText('QR-код готов')).toBeTruthy();
  });

  it('renders step numbers', () => {
    render(<Steps />);
    expect(screen.getByText('01')).toBeTruthy();
    expect(screen.getByText('02')).toBeTruthy();
    expect(screen.getByText('03')).toBeTruthy();
  });
});
