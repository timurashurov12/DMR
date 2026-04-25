import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Pricing } from './Pricing';

describe('Pricing', () => {
  const renderPricing = () =>
    render(<MemoryRouter><Pricing /></MemoryRouter>);

  it('renders section heading', () => {
    renderPricing();
    expect(screen.getByText('Выберите свой план')).toBeTruthy();
  });

  it('renders Free plan as free', () => {
    renderPricing();
    expect(screen.getByText(/навсегда/i)).toBeTruthy();
  });

  it('renders Starter plan price in sum', () => {
    renderPricing();
    expect(screen.getByText(/99 000/)).toBeTruthy();
    expect(screen.getByText(/сум\/мес/)).toBeTruthy();
  });

  it('renders Pro plan price in sum', () => {
    renderPricing();
    expect(screen.getByText(/299 000/)).toBeTruthy();
  });

  it('marks Starter as popular', () => {
    renderPricing();
    expect(screen.getByText(/Популярный/i)).toBeTruthy();
  });

  it('all plan CTAs link to /register', () => {
    renderPricing();
    const links = screen.getAllByRole('link');
    const registerLinks = links.filter((l) => l.getAttribute('href') === '/register');
    expect(registerLinks.length).toBe(3);
  });
});
