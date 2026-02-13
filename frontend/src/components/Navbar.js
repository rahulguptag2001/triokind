// components/Navbar.js - Navigation Bar Component (Mobile Optimized)
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const Navbar = () => {
  const { getCartCount, user, logout } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  // Close mobile menu when window is resized to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [mobileMenuOpen]);

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate('/');
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo" onClick={closeMobileMenu}>
          <span className="logo-icon">⚕</span>
          <span className="logo-text">Triokind Pharmaceuticals</span>
        </Link>

        <button 
          className={`mobile-menu-btn ${mobileMenuOpen ? 'active' : ''}`}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        {/* Mobile menu overlay */}
        {mobileMenuOpen && (
          <div 
            className="mobile-menu-overlay" 
            onClick={closeMobileMenu}
          />
        )}

        <ul className={`nav-menu ${mobileMenuOpen ? 'active' : ''}`}>
          <li><Link to="/" onClick={closeMobileMenu}>Home</Link></li>
          <li><Link to="/products" onClick={closeMobileMenu}>Products</Link></li>
          <li><Link to="/about" onClick={closeMobileMenu}>About</Link></li>
          <li><Link to="/team" onClick={closeMobileMenu}>Team</Link></li>
          <li><Link to="/contact" onClick={closeMobileMenu}>Contact</Link></li>
          
          {/* Mobile-only user menu items */}
          <div className="mobile-user-menu">
            {user ? (
              <>
                <li><span className="mobile-user-greeting">Hello, {user.firstName}!</span></li>
                <li><Link to="/orders" onClick={closeMobileMenu}>My Orders</Link></li>
                <li><button onClick={handleLogout} className="logout-mobile-btn">Logout</button></li>
              </>
            ) : (
              <>
                <li><Link to="/login" onClick={closeMobileMenu}>Login</Link></li>
                <li><Link to="/register" onClick={closeMobileMenu}>Sign Up</Link></li>
              </>
            )}
          </div>
        </ul>

        <div className="nav-actions">
          {user ? (
            <div className="user-menu desktop-only">
              <span className="user-name">Hello, {user.firstName}</span>
              <Link to="/orders" className="nav-link">My Orders</Link>
              <button onClick={handleLogout} className="btn-link">Logout</button>
            </div>
          ) : (
            <div className="desktop-only auth-buttons">
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/register" className="btn btn-primary">Sign Up</Link>
            </div>
          )}
          
          <Link to="/cart" className="cart-btn" onClick={closeMobileMenu}>
            <span className="cart-icon">🛒</span>
            {getCartCount() > 0 && (
              <span className="cart-badge">{getCartCount()}</span>
            )}
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;