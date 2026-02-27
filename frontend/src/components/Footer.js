// components/Footer.js - Footer Component
import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h3>About Triokind</h3>
          <p>
            Leading provider of quality pharmaceutical products, committed to
            improving health and wellness for all.
          </p>
        </div>

        <div className="footer-section">
          <h3>Quick Links</h3>
          <ul>
            <li><Link to="/products">Products</Link></li>
            <li><Link to="/about">About Us</Link></li>
            <li><Link to="/team">Our Team</Link></li>
            <li><Link to="/contact">Contact</Link></li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>Customer Service</h3>
          <ul>
            <li><Link to="/orders">Track Order</Link></li>
            <li><a href="#faq">FAQ</a></li>
            <li><a href="#shipping">Shipping Info</a></li>
            <li><a href="#returns">Returns</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>Contact Us</h3>
          <p>📧 triokindpharmaceuticalspvtltd@gmail.com</p>
          <p>📞 9582878282</p>
          <p>📍 123 Pharma Street, Medical City</p>
        </div>
      </div>
      <div className="whatsapp-float">
        <a 
          href="https://wa.me/919582878282?text=Hello%20Triokind%20Pharmaceuticals,%20I%20would%20like%20to%20inquire%20about%20your%20products" 
          rel="noopener noreferrer"
          target="_blank" 
          className="whatsapp-button"
        >
    <span className="whatsapp-icon">💬</span>
    <span>WhatsApp Us</span>
    </a>
</div>
      <div className="footer-bottom">
        <p>&copy; 2026 Triokind Pharmaceuticals. All rights reserved.</p>
        <div className="footer-links">
          <a href="#privacy">Privacy Policy</a>
          <a href="#terms">Terms of Service</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;