import React, { useState, useEffect } from 'react';
import { FiHome, FiMenu, FiX, FiHash, FiSun, FiMoon } from 'react-icons/fi';
import { HiOutlineLanguage } from 'react-icons/hi2';

export default function Navbar({ currentTab, setCurrentTab }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme) return savedTheme === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });
  useEffect(() => {
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const navigation = [
    { id: 'inicio', name: 'Inicio', icon: FiHome },
    { id: 'vocales', name: 'Vocales', icon: HiOutlineLanguage },
    { id: 'numeros', name: 'Números', icon: FiHash },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-md dark:border-emerald-950/40 dark:bg-[#09120e]/80 transition-colors duration-500">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex flex-shrink-0 items-center cursor-pointer" onClick={() => setCurrentTab('inicio')}>
            <span className="bg-gradient-to-r from-emerald-600 to-teal-500 dark:from-emerald-400 dark:to-teal-500 bg-clip-text text-xl font-bold tracking-wider text-transparent uppercase">
              Señas IA
            </span>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-4">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => setCurrentTab(item.id)}
                    className={`group flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200 
                      ${isActive 
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold' 
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-[#060c09] dark:hover:text-emerald-400'
                      }`}
                  >
                    <Icon className={`h-4 w-4 transition-colors 
                      ${isActive 
                        ? 'text-emerald-600 dark:text-emerald-400' 
                        : 'text-slate-400 group-hover:text-slate-900 dark:text-slate-400 dark:group-hover:text-emerald-400'
                      }`} 
                    />
                    {item.name}
                  </button>
                );
              })}
              <button
                onClick={() => setIsDark(!isDark)}
                className="ml-2 p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-[#060c09] dark:hover:text-emerald-400 transition-all duration-200"
                aria-label="Toggle Theme"
              >
                {isDark ? <FiSun className="h-5 w-5 text-amber-500" /> : <FiMoon className="h-5 w-5 text-slate-600" />}
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={() => setIsDark(!isDark)}
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-[#060c09] transition-all"
              aria-label="Toggle Theme"
            >
              {isDark ? <FiSun className="h-5 w-5 text-amber-500" /> : <FiMoon className="h-5 w-5 text-slate-600" />}
            </button>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center rounded-xl p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus:outline-none dark:text-slate-400 dark:hover:bg-[#060c09] dark:hover:text-white transition-all"
            >
              {isOpen ? <FiX className="h-6 w-6" /> : <FiMenu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>
      <div className={`md:hidden transition-all duration-300 ${isOpen ? 'block' : 'hidden'}`}>
        <div className="space-y-1 px-2 pb-3 pt-2 sm:px-3 border-t border-slate-200 dark:border-emerald-950/40 bg-white/95 dark:bg-[#09120e]/95 backdrop-blur-md">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentTab(item.id);
                  setIsOpen(false);
                }}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-base font-medium transition-all
                  ${isActive 
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold' 
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-emerald-950/30 dark:hover:text-emerald-400'
                  }`}
              >
                <Icon className="h-5 w-5" />
                {item.name}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}