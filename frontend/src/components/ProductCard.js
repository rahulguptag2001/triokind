// components/ProductCard.js - Product Card Component
import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();

  const handleAddToCart = (e) => {
    e.preventDefault();
    addToCart(product);
    // Removed alert - cart badge will update automatically
  };

  return (
    <div className="product-card">
      <Link to={`/product/${product.id}`} className="product-link">
        <div className="product-image">
          {product.image_url ? (
            <img src={product.image_url} alt={product.name} />
          ) : (
            <div className="product-placeholder">
              <span className="placeholder-icon">💊</span>
            </div>
          )}
          {product.featured && <span className="featured-badge">Featured</span>}
          {product.prescription_required && (
            <span className="prescription-badge">Rx Required</span>
          )}
        </div>

        <div className="product-info">
          <h3 className="product-name">{product.name}</h3>
          <p className="product-manufacturer">{product.manufacturer}</p>
          <p className="product-dosage">{product.dosage}</p>
          
          <div className="product-footer">
            <span className="product-price">₹{product.price}</span>
            <button 
              className="btn btn-primary btn-small"
              onClick={handleAddToCart}
            >
              Add to Cart
            </button>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;