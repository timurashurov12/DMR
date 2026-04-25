import { Link } from 'react-router-dom';
import { UtensilsCrossed } from 'lucide-react';

export function Nav() {
  return (
    <nav
      className="sticky top-0 z-50 flex items-center justify-between px-16 py-4 backdrop-blur-md"
      style={{
        background: 'rgba(26, 21, 16, 0.88)',
        borderBottom: '1px solid rgba(201, 169, 98, 0.1)',
      }}
    >
      <Link to="/" className="flex items-center gap-3 no-underline">
        <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center">
          <UtensilsCrossed className="w-5 h-5 text-dark" />
        </div>
        <span className="text-lg font-bold text-inverse">DMR</span>
      </Link>

      <div className="hidden md:flex items-center gap-8">
        <a href="#pricing" className="text-sm font-medium text-inverse/55 hover:text-inverse transition-colors">
          Тарифы
        </a>
        <a href="#features" className="text-sm font-medium text-inverse/55 hover:text-inverse transition-colors">
          Возможности
        </a>
        <a href="#faq" className="text-sm font-medium text-inverse/55 hover:text-inverse transition-colors">
          FAQ
        </a>
      </div>

      <div className="flex items-center gap-3">
        <Link
          to="/login"
          className="text-sm text-inverse/60 px-4 py-2 rounded-lg transition-colors hover:text-inverse"
          style={{ border: '1px solid rgba(255, 255, 255, 0.12)' }}
        >
          Войти
        </Link>
        <Link
          to="/register"
          className="text-sm font-bold text-dark bg-accent px-5 py-2.5 rounded-lg hover:bg-accent-hover transition-colors"
        >
          Начать бесплатно
        </Link>
      </div>
    </nav>
  );
}
