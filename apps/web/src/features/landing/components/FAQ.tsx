import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useInView } from '@/features/landing/lib/useInView';

const faqs = [
  {
    question: 'Сколько стоит пробный период?',
    answer: 'Пробный период абсолютно бесплатный и длится 14 дней. Вам не нужно указывать данные банковской карты для начала.',
  },
  {
    question: 'Можно ли отменить подписку?',
    answer: 'Да, вы можете отменить подписку в любой момент в личном кабинете. После отмены доступ к платным функциям сохранится до конца оплаченного периода.',
  },
  {
    question: 'Какие способы оплаты поддерживаются?',
    answer: 'Принимаем банковские карты Visa и Mastercard, а также популярные платёжные системы. Список доступных методов расширяется.',
  },
  {
    question: 'Можно ли использовать сервис для нескольких заведений?',
    answer: 'Да, на тарифах Starter и Pro вы можете управлять несколькими заведениями из одного аккаунта.',
  },
  {
    question: 'Нужны ли технические навыки?',
    answer: 'Нет, наш сервис создан для людей без технического образования. Интерфейс интуитивно понятен и не требует обучения.',
  },
  {
    question: 'Есть ли мобильное приложение?',
    answer: 'Для гостей меню работает в браузере без установки приложения. Для администрирования также можно использовать браузер на любом устройстве.',
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const header = useInView();

  return (
    <section id="faq" className="py-24 px-16" style={{ background: '#fafafa' }}>
      <div className="landing-container">
        <div
          ref={header.ref}
          className={`text-center mb-12 opacity-0 ${header.inView ? 'animate-fade-up' : ''}`}
        >
          <span
            className="inline-flex text-xs font-bold tracking-widest uppercase px-3.5 py-1.5 rounded-full mb-4"
            style={{ background: '#1a1510', color: '#c9a962', letterSpacing: '1.5px' }}
          >
            Вопросы
          </span>
          <h2 className="text-[44px] font-black mb-3" style={{ color: '#1a1510', letterSpacing: '-1px' }}>
            Часто задаваемые вопросы
          </h2>
          <p className="section-subtitle max-w-lg mx-auto">
            Ответы на популярные вопросы о нашем сервисе
          </p>
        </div>

        <div className="max-w-2xl mx-auto flex flex-col gap-3">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl overflow-hidden"
              style={{ border: '1px solid #e8e8e8' }}
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between px-6 py-5 text-left transition-colors hover:bg-stone-50"
              >
                <span className="font-semibold pr-4" style={{ color: '#1a1510' }}>
                  {faq.question}
                </span>
                <ChevronDown
                  className="w-5 h-5 shrink-0 transition-transform duration-200"
                  style={{
                    color: '#c9a962',
                    transform: openIndex === index ? 'rotate(180deg)' : 'rotate(0deg)',
                  }}
                />
              </button>
              {openIndex === index && (
                <div className="px-6 pb-5 text-sm leading-relaxed" style={{ color: '#6b6560' }}>
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
