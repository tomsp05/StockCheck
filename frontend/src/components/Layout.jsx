import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, Package, Tags, MapPin, ArrowRightLeft, Bell, Settings, Sparkles } from 'lucide-react';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/products', label: 'Products', icon: Package },
  { to: '/categories', label: 'Categories', icon: Tags },
  { to: '/locations', label: 'Locations', icon: MapPin },
  { to: '/stock-levels', label: 'Stock Levels', icon: ArrowRightLeft },
  { to: '/alerts', label: 'Alerts', icon: Bell },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export default function Layout() {
  return (
    <div className="app">
      <nav className="top-nav">
        <div className="top-nav-inner">
          <NavLink to="/" className="top-nav-brand">
            <Sparkles size={20} />
            StockCheck
          </NavLink>
          <ul className="top-nav-links">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.to === '/'}
                    className={({ isActive }) => (isActive ? 'active' : '')}
                  >
                    <Icon size={15} />
                    {item.label}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
