'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

const NAV_ITEMS = [
  { href: '/dashboard', label: '대시보드', icon: '📊' },
  { href: '/todos', label: '할 일', icon: '✅' },
  { href: '/weekly', label: '주간 계획', icon: '📅' },
  { href: '/goals', label: '1년 목표', icon: '🎯' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
  };

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="fixed top-4 left-4 z-50 md:hidden bg-background text-foreground p-2 rounded-[8px] border border-hairline shadow-card"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? '✕' : '☰'}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-40 h-full w-64
          bg-background border-r border-hairline
          transform transition-transform duration-200 ease-in-out
          md:translate-x-0 md:static md:z-auto
          flex flex-col
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Logo */}
        <div className="px-6 py-5 border-b border-hairline-soft">
          <h1 className="text-[22px] font-bold text-rausch tracking-tight">목표+계획</h1>
          <p className="text-sm text-muted mt-0.5">목표 기반 할일 관리</p>
        </div>

        {/* Navigation */}
        <nav className="mt-2 flex-1 px-3">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-2.5 text-sm rounded-[8px] my-0.5 transition-colors
                  ${isActive
                    ? 'bg-surface-soft text-foreground font-semibold'
                    : 'text-muted hover:bg-surface-soft hover:text-foreground'
                  }
                `}
              >
                <span className="text-base">{item.icon}</span>
                <span>{item.label}</span>
                {isActive && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-rausch" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Theme toggle */}
        <div className="px-3 pb-4 border-t border-hairline-soft pt-3">
          <button
            onClick={toggleTheme}
            className="flex items-center gap-3 px-4 py-2.5 text-sm rounded-[8px] w-full text-muted hover:bg-surface-soft hover:text-foreground transition-colors"
          >
            <span className="text-base">{isDark ? '☀️' : '🌙'}</span>
            <span>{isDark ? '라이트 모드' : '다크 모드'}</span>
          </button>
        </div>
      </aside>
    </>
  );
}
