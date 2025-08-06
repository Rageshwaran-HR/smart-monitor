'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Navigation() {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'Home', icon: '🏠' },
    { href: '/music', label: 'Music', icon: '🎵' },
  ];

  return (
    <nav className="fixed top-6 left-6 z-50 bg-black/30 backdrop-blur-md rounded-2xl p-4 border border-white/10">
      <div className="flex space-x-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-300 ${
              pathname === item.href
                ? 'bg-gradient-to-r from-green-400/20 to-blue-500/20 text-white border border-green-400/30'
                : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            <span className="font-medium">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
