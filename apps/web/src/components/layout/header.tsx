import type { PublicUser } from '@template/contracts';
import Link from 'next/link';

import { LogoutButton } from '../../features/auth/logout-button';

import { Nav, type NavItem } from './nav';

const PUBLIC_NAV_ITEMS: NavItem[] = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
];

const AUTHENTICATED_NAV_ITEMS: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/profile', label: 'Profile' },
  { href: '/files', label: 'Files' },
];

export function Header({ user }: { user: PublicUser | null }) {
  const items = user ? AUTHENTICATED_NAV_ITEMS : PUBLIC_NAV_ITEMS;

  return (
    <header className="header">
      <div className="headerInner">
        <Link href="/" className="brand">
          Fullstack TS Template
        </Link>
        <Nav items={items} />
        {user ? (
          <LogoutButton />
        ) : (
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <Link href="/login" className="navLink">
              Log in
            </Link>
            <Link href="/register" className="navLink">
              Register
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
