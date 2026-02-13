// pages/ProductDetail.js - Single Product Detail Page
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await axios.get(`${API_URL}/products/${id}`);
      setProduct(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching product:', error);
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    addToCart(product, quantity);
    // Cart badge will update automatically - no alert needed
  };

  const handleBuyNow = () => {
    addToCart(product, quantity);
    navigate('/cart');
  };

  if (loading) {
    return <div className="loading-container"><p>Loading product...</p></div>;
  }

  if (!product) {
    return <div className="error-container"><p>Product not found</p></div>;
  }

  return (
    <div className="product-detail-page">
      <div className="container">
        <button onClick={() => navigate(-1)} className="back-btn">
          ← Back to Products
        </button>

        <div className="product-detail">
          <div className="product-image-large">
            {product.image_url ? (
              <img src={product.image_url} alt={product.name} />
            ) : (
              <div className="product-placeholder-large">
                <span className="placeholder-icon-large">💊</span>
              </div>
            )}
          </div>

          <div className="product-info-detail">
            <h1 className="product-title">{product.name}</h1>
            <p className="product-manufacturer">By {product.manufacturer}</p>
            
            <div className="product-badges">
              {product.featured && <span className="badge badge-featured">Featured</span>}
              {product.prescription_required && (
                <span className="badge badge-prescription">Prescription Required</span>
              )}
            </div>

            <div className="product-price-large">${product.price}</div>

            <div className="product-meta">
              <p><strong>Dosage:</strong> {product.dosage}</p>
              <p><strong>Category:</strong> {product.category_name}</p>
              <p><strong>Stock:</strong> {product.stock_quantity > 0 ? 
                `${product.stock_quantity} units available` : 
                'Out of stock'
              }</p>
            </div>

            <div className="product-description">
              <h3>Description</h3>
              <p>{product.description}</p>
            </div>

            {product.stock_quantity > 0 && (
              <div className="product-actions">
                <div className="quantity-selector">
                  <label>Quantity:</label>
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="qty-btn"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    min="1"
                    max={product.stock_quantity}
                    className="qty-input"
                  />
                  <button 
                    onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                    className="qty-btn"
                  >
                    +
                  </button>
                </div>

                <div className="action-buttons">
                  <button onClick={handleAddToCart} className="btn btn-secondary btn-large">
                    Add to Cart
                  </button>
                  <button onClick={handleBuyNow} className="btn btn-primary btn-large">
                    Buy Now
                  </button>
                </div>
              </div>
            )}

            {product.prescription_required && (
              <div className="prescription-notice">
                <p>⚠️ This product requires a valid prescription. You will need to upload your prescription during checkout.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;