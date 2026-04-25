import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useInView } from '@/features/landing/lib/useInView';

export function CTA() {
  const { ref, inView } = useInView();

  return (
    <section className="py-24 px-16" style={{ background: '#1a1510' }}>
      <div className="landing-container">
        <div
          ref={ref}
          className={`max-w-3xl mx-auto text-center rounded-3xl px-16 py-20 relative overflow-hidden opacity-0 ${
            inView ? 'animate-fade-up' : ''
          }`}
          style={{
            background: 'linear-gradient(135deg, #2d2520 0%, #1a1510 100%)',
            border: '1px solid rgba(201, 169, 98, 0.2)',
            boxShadow: '0 0 80px -20px rgba(201, 169, 98, 0.1)',
          }}
        >
          {/* Decorative glow */}
          <div
            className="absolute pointer-events-none"
            style={{
              top: -100,
              right: -100,
              width: 300,
              height: 300,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(201,169,98,0.08), transparent 70%)',
            }}
          />

          <h2
            className="text-5xl font-black text-inverse mb-4 relative"
            style={{ letterSpacing: '-1px' }}
          >
            Готовы начать?
          </h2>
          <p className="text-lg mb-10 relative" style={{ color: 'rgba(255,255,255,0.5)' }}>
            Присоединяйтесь к сотням заведений, которые уже используют цифровое меню DMR
          </p>
          <Link to="/register" className="btn-accent text-base px-8 py-4 inline-flex relative">
            Создать аккаунт бесплатно
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
