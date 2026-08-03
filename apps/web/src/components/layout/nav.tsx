'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export interface NavItem {
  href: string;
  label: string;
}

export function Nav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav aria-label="Main navigation">
      <button
        type="button"
        className="navToggle"
        aria-expanded={isOpen}
        aria-controls="main-nav-list"
        onClick={() => setIsOpen((open) => !open)}
      >
        Menu
      </button>
      <ul id="main-nav-list" className={`navList ${isOpen ? '' : 'navListHidden'}`.trim()}>
        {items.map((item) => {
          const isActive = pathname === item.href;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`navLink ${isActive ? 'navLinkActive' : ''}`.trim()}
                aria-current={isActive ? 'page' : undefined}
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
