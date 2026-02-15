import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, Blocks, Tags, MapPin, Bell, Settings, Sparkles } from 'lucide-react';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/stock', label: 'Stock Levels', icon: Package },
  { to: '/products', label: 'Products', icon: Blocks },
  { to: '/categories', label: 'Categories', icon: Tags },
  { to: '/locations', label: 'Locations', icon: MapPin },
  { to: '/alerts', label: 'Alerts', icon: Bell },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export default function Navbar() {
  const location = useLocation();

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">
          <Sparkles size={22} />
          StockCheck
        </Link>
      </div>
      <ul className="navbar-links">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <li key={item.to}>
              <Link
                to={item.to}
                className={location.pathname === item.to ? 'active' : ''}
              >
                <Icon size={16} />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
