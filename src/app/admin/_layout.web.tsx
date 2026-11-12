import '../../components/admin/admin.css';
import { Link, Redirect, Slot, usePathname } from 'expo-router';
import type { Href } from 'expo-router';
import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { useAuth } from '../../context/AuthContext';

const navigation = [
  { href: '/admin', label: 'Overview', icon: '▦' },
  { href: '/admin/users', label: 'Accounts', icon: '♙', badge: '2' },
  { href: '/admin/analytics', label: 'Analytics', icon: '⌁' },
  { href: '/admin/achievements', label: 'Achievements', icon: '✦' },
  { href: '/admin/shop', label: 'Shop', icon: '▣' },
  { href: '/admin/notifications', label: 'Notifications', icon: '♧' },
] as const;

type AdminHref = (typeof navigation)[number]['href'];

function NavigationLink({
  href,
  children,
  className,
}: {
  href: AdminHref;
  children: ReactNode;
  className: string;
}) {
  return (
    <Link href={href as Href} asChild>
      <a className={className}>{children}</a>
    </Link>
  );
}

export default function AdminWebLayout() {
  const { role, signOut } = useAuth();
  const pathname = usePathname();
  const [search, setSearch] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  useEffect(() => {
    document.body.classList.add('admin-dashboard-body');
    return () => document.body.classList.remove('admin-dashboard-body');
  }, []);
  if (role !== 'admin') return <Redirect href="/" />;

  const matchingLinks = navigation.filter((link) =>
    link.label.toLowerCase().includes(search.trim().toLowerCase())
  );
  const activePage =
    navigation.find((link) => link.href === pathname)?.label ?? 'Overview';

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <NavigationLink href="/admin" className="brand-lockup">
          <span className="brand-mark">G</span>
          <span className="brand-copy">
            <strong>GuildMaster</strong>
            <small>Admin console</small>
          </span>
        </NavigationLink>
        <div className="sidebar-label">Realm</div>
        <nav className="sidebar-nav" aria-label="Admin navigation">
          {navigation.map((item) => (
            <NavigationLink
              key={item.href}
              href={item.href}
              className={`sidebar-link${pathname === item.href ? ' active' : ''}`}
            >
              <span className="nav-icon" aria-hidden="true">
                {item.icon}
              </span>
              <span>{item.label}</span>
              {'badge' in item ? (
                <span className="nav-badge">{item.badge}</span>
              ) : null}
            </NavigationLink>
          ))}
        </nav>
        <div className="sidebar-spacer" />
        <div className="realm-health">
          <span className="health-dot" />
          <span>
            <strong>Realm healthy</strong>
            <small>All systems operational</small>
          </span>
        </div>
        <div className="sidebar-profile">
          <span className="profile-avatar">AK</span>
          <span>
            <strong>Aria Keeper</strong>
            <small>Super Admin</small>
          </span>
          <button
            onClick={() => void signOut()}
            className="signout-button"
            aria-label="Sign out"
            title="Sign out"
          >
            ···
          </button>
        </div>
      </aside>
      <div className="admin-main">
        <header className="admin-topbar">
          <div className="breadcrumbs">
            <span>Realm</span>
            <span className="breadcrumb-separator">›</span>
            <strong>{activePage}</strong>
          </div>
          <div className="topbar-actions">
            <label className="global-search">
              <span aria-hidden="true">⌕</span>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search dashboard…"
                aria-label="Search dashboard navigation"
              />
              <kbd>⌘ K</kbd>
              {search ? (
                <div className="search-results">
                  {matchingLinks.length ? (
                    matchingLinks.map((item) => (
                      <NavigationLink
                        key={item.href}
                        href={item.href}
                        className="search-result"
                      >
                        {item.label}
                        <span>Open →</span>
                      </NavigationLink>
                    ))
                  ) : (
                    <span className="search-empty">
                      No dashboard pages found.
                    </span>
                  )}
                </div>
              ) : null}
            </label>
            <div className="notification-wrap">
              <button
                className="notification-button"
                onClick={() => setShowNotifications((open) => !open)}
                aria-label="Notifications"
                aria-expanded={showNotifications}
              >
                <span aria-hidden="true">♧</span>
                <i />
              </button>
              {showNotifications ? (
                <div className="notification-popover">
                  Notifications aren’t connected to a data source yet.
                </div>
              ) : null}
            </div>
          </div>
        </header>
        <main className="admin-content">
          <Slot />
        </main>
      </div>
    </div>
  );
}
