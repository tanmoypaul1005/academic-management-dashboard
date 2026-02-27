'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const navItems = [
  { href: '/', label: 'Dashboard', icon: '📊' },
  { href: '/students', label: 'Students', icon: '👨‍🎓' },
  { href: '/courses', label: 'Courses', icon: '📚' },
  { href: '/faculty', label: 'Faculty', icon: '👨‍🏫' },
  { href: '/reports', label: 'Reports', icon: '📈' },
];

export default function Navigation() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const isActiveItem = (href: string) =>
    href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(href + '/');

  const currentPage =
    navItems.find((item) => isActiveItem(item.href))?.label ?? 'Dashboard';

  return (
    <>
      {/* ===== MOBILE TOP BAR — always fixed, never hidden on scroll ===== */}
      <header
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between h-16 px-4 shadow-xl lg:hidden"
        style={{
          background: 'linear-gradient(135deg, #1e1b4b 0%, #4338ca 100%)',
        }}
      >
        {/* Left: burger + brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-10 h-10 flex flex-col items-center justify-center gap-[5px] rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
            aria-label="Toggle menu"
          >
            <span
              className={`block w-5 h-0.5 bg-white rounded-full transition-all duration-300 ${
                isOpen ? 'rotate-45 translate-y-[7px]' : ''
              }`}
            />
            <span
              className={`block w-5 h-0.5 bg-white rounded-full transition-all duration-300 ${
                isOpen ? 'opacity-0' : ''
              }`}
            />
            <span
              className={`block w-5 h-0.5 bg-white rounded-full transition-all duration-300 ${
                isOpen ? '-rotate-45 -translate-y-[7px]' : ''
              }`}
            />
          </button>
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 text-lg rounded-lg bg-white/20">
              🎓
            </div>
            <span className="text-base font-bold tracking-wide text-white">Academic</span>
          </div>
        </div>

        {/* Right: current page label */}
        <span className="pr-1 text-sm font-medium text-indigo-200">{currentPage}</span>
      </header>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 lg:hidden bg-black/60 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* ===== SIDEBAR ===== */}
      <aside
        className={`fixed top-0 left-0 h-full w-72 z-40 flex flex-col transition-transform duration-300 ease-in-out shadow-2xl
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0`}
        style={{
          background: 'linear-gradient(180deg, #1e1b4b 0%, #312e81 45%, #1e3a5f 100%)',
        }}
      >
        {/* Brand */}
        <div className="px-6 py-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div
              className="flex items-center justify-center text-2xl shadow-lg w-11 h-11 rounded-2xl"
              style={{ background: 'rgba(255,255,255,0.15)' }}
            >
              🎓
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight tracking-wide text-white">Academic</h1>
              <p className="text-xs font-medium text-indigo-300">Management System</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-4 py-5 overflow-y-auto">
          <p className="text-indigo-400 text-[11px] font-bold uppercase tracking-widest mb-4 px-3">
            Main Menu
          </p>
          <ul className="space-y-1">
            {navItems.map((item) => {
                const isActive = isActiveItem(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
                      ${isActive
                        ? 'text-white shadow-lg'
                        : 'text-indigo-200 hover:text-white'}
                    `}
                    style={
                      isActive
                        ? { background: 'rgba(255,255,255,0.18)' }
                        : undefined
                    }
                    onMouseEnter={(e) => {
                      if (!isActive)
                        (e.currentTarget as HTMLElement).style.background =
                          'rgba(255,255,255,0.08)';
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive)
                        (e.currentTarget as HTMLElement).style.background = '';
                    }}
                  >
                    <span className="flex-shrink-0 text-xl text-center w-7">{item.icon}</span>
                    <span className="text-sm font-semibold tracking-wide">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="px-4 py-4 border-t border-white/10">
          <div
            className="flex items-center gap-3 px-3 py-3 rounded-xl"
            style={{ background: 'rgba(255,255,255,0.07)' }}
          >
            <div className="flex items-center justify-center text-sm font-bold text-white rounded-full shadow w-9 h-9 bg-gradient-to-br from-indigo-400 to-blue-500">
              A
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">Admin User</p>
              <p className="text-xs text-indigo-300 truncate">Administrator</p>
            </div>
            <span className="flex-shrink-0 w-2 h-2 ml-auto rounded-full bg-emerald-400" title="Online" />
          </div>
        </div>
      </aside>
    </>
  );
}
