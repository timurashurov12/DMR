import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FAQ } from './FAQ';

describe('FAQ', () => {
  it('renders heading', () => {
    render(<FAQ />);
    expect(screen.getByText('Часто задаваемые вопросы')).toBeTruthy();
  });

  it('renders all questions', () => {
    render(<FAQ />);
    expect(screen.getByText('Сколько стоит пробный период?')).toBeTruthy();
    expect(screen.getByText('Можно ли отменить подписку?')).toBeTruthy();
    expect(screen.getByText('Нужны ли технические навыки?')).toBeTruthy();
  });

  it('opens answer on click', () => {
    render(<FAQ />);
    const question = screen.getByText('Сколько стоит пробный период?');
    fireEvent.click(question);
    expect(screen.getByText(/абсолютно бесплатный/i)).toBeTruthy();
  });

  it('does not mention Kaspi', () => {
    render(<FAQ />);
    expect(screen.queryByText(/Kaspi/i)).toBeNull();
  });
});
