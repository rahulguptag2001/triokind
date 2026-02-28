// pages/Home.js - Home Page
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import ProductCard from '../components/ProductCard';

const API_URL = process.env.REACT_APP_API_URL;

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      const response = await axios.get(`${API_URL}/products/featured`);
      setFeaturedProducts(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching featured products:', error);
      setLoading(false);
    }
  };

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">
            Your Health, Our Priority
          </h1>
          <p className="hero-subtitle">
            Quality pharmaceutical products delivered to your door
          </p>
          <Link to="/products" className="btn btn-primary btn-large">
            Shop Now
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <div className="feature-grid">
            <div className="feature-card">
              <span className="feature-icon">🚚</span>
              <h3>Fast Delivery</h3>
              <p>Quick and reliable shipping to your location</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">✅</span>
              <h3>Quality Assured</h3>
              <p>All products are certified and tested</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">💰</span>
              <h3>Best Prices</h3>
              <p>Competitive pricing on all medications</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">🔒</span>
              <h3>Secure Shopping</h3>
              <p>Safe and encrypted transactions</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="featured-products">
        <div className="container">
          <h2 className="section-title">Featured Products</h2>
          
          {loading ? (
            <p className="loading-text">Loading products...</p>
          ) : (
            <div className="product-grid">
              {featuredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          <div className="text-center">
            <Link to="/products" className="btn btn-secondary">
              View All Products
            </Link>
          </div>
        </div>
      </section>

      {/* About Preview */}
      <section className="about-preview">
        <div className="container">
          <div className="about-content">
            <h2>About Trokind Pharmaceuticals</h2>
            <p>
              We are a leading pharmaceutical company dedicated to providing
              high-quality medications and healthcare products. With over 20 years
              of experience, we've built a reputation for excellence and trust.
            </p>
            <Link to="/about" className="btn btn-secondary">
              Learn More About Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;