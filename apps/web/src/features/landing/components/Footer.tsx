import { Link } from 'react-router-dom';
import { UtensilsCrossed } from 'lucide-react';

export function Footer() {
  return (
    <footer className="py-12 bg-dark border-t border-dark-tertiary">
      <div className="landing-container">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <Link to="/" className="flex items-center gap-3 text-inverse">
            <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
              <UtensilsCrossed className="w-5 h-5 text-dark" />
            </div>
            <span className="font-bold text-lg">DMR</span>
          </Link>

          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-inverse/60">
            <Link to="/" className="hover:text-inverse transition-colors">
              Главная
            </Link>
            <Link to="/#pricing" className="hover:text-inverse transition-colors">
              Тарифы
            </Link>
            <Link to="/#features" className="hover:text-inverse transition-colors">
              Возможности
            </Link>
            <Link to="/#faq" className="hover:text-inverse transition-colors">
              FAQ
            </Link>
          </div>

          <p className="text-sm text-inverse/40">
            © 2024 DMR. Все права защищены.
          </p>
        </div>
      </div>
    </footer>
  );
}