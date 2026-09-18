import React, { useState, useEffect } from 'react';
import { Wind, Sparkles, Mail } from 'lucide-react';

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const triggerBreeze = () => {
    window.dispatchEvent(new CustomEvent('trigger-dandelion-breeze', { detail: { power: 1.3 } }));
  };

  const navLinks = [
    { name: '关于', href: '#about' },
    { name: '作品', href: '#projects' },
    { name: '技能', href: '#skills' },
    { name: '历程', href: '#experience' },
    { name: '联络', href: '#contact' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 py-4 sm:py-6 transition-all duration-300">
      <nav
        className={`w-full max-w-5xl rounded-full px-5 py-2.5 flex items-center justify-between transition-all duration-300 ${
          isScrolled
            ? 'bg-[#0b101c]/80 backdrop-blur-xl border border-white/10 shadow-[0_12px_30px_-10px_rgba(0,0,0,0.6)]'
            : 'bg-white/[0.03] backdrop-blur-md border border-white/5 shadow-none'
        }`}
      >
        {/* Logo / Brand */}
        <a href="#" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-sky-400 to-indigo-500 flex items-center justify-center p-[1px] shadow-sm shadow-sky-500/20 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-[#070a12] rounded-full flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-sky-400 group-hover:rotate-12 transition-transform" />
            </div>
          </div>
          <span className="font-semibold text-sm tracking-tight text-white/90 group-hover:text-white transition-colors">
            Alex.Design
          </span>
          <span className="hidden md:inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-400/90 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full ml-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            开放接案 / 合作
          </span>
        </a>

        {/* Center Links */}
        <div className="hidden sm:flex items-center gap-1 text-xs md:text-sm font-medium text-slate-300">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="px-3.5 py-1.5 rounded-full hover:text-white hover:bg-white/[0.07] transition-all duration-200"
            >
              {link.name}
            </a>
          ))}
        </div>

        {/* Right CTA: Interactive breeze button & contact */}
        <div className="flex items-center gap-2">
          <button
            onClick={triggerBreeze}
            title="轻吹一口气：扬起蒲公英"
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border border-sky-500/20 hover:border-sky-500/35 transition-all duration-200 active:scale-95 group"
          >
            <Wind className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform text-sky-400" />
            <span className="hidden xs:inline">轻吹微风</span>
          </button>

          <a
            href="#contact"
            className="hidden sm:flex items-center gap-1.5 text-xs font-medium px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/15 text-white border border-white/15 transition-all active:scale-95"
          >
            <Mail className="w-3.5 h-3.5 text-slate-300" />
            <span>联络我</span>
          </a>
        </div>
      </nav>
    </header>
  );
};
