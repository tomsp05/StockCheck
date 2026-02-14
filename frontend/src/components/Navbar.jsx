import { Link, useLocation } from 'react-router-dom';

const navItems = [
  { to: '/', label: 'Dashboard' },
  { to: '/stock', label: 'Stock Levels' },
  { to: '/products', label: 'Products' },
  { to: '/locations', label: 'Locations' },
  { to: '/alerts', label: 'Alerts' },
  { to: '/settings', label: 'Settings' },
];

export default function Navbar() {
  const location = useLocation();

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">StockCheck</Link>
      </div>
      <ul className="navbar-links">
        {navItems.map((item) => (
          <li key={item.to}>
            <Link
              to={item.to}
              className={location.pathname === item.to ? 'active' : ''}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
