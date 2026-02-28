// pages/OrderSuccess.js - Order Success Page with Payment Info
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const OrderSuccess = () => {
  const location = useLocation();
  const { orderId, paymentId } = location.state || {};

  return (
    <div className="order-success-page">
      <div className="container">
        <div className="success-card">
          <div className="success-icon">✓</div>
          <h1>Order Placed Successfully!</h1>
          <p>Thank you for your purchase from Triokind Pharmaceuticals.</p>
          
          {orderId && (
            <div className="order-details">
              <p><strong>Order ID:</strong> #{orderId}</p>
              {paymentId && (
                <p><strong>Payment ID:</strong> {paymentId}</p>
              )}
            </div>
          )}

          <div className="success-info">
            <p>✅ Your order has been confirmed</p>
            <p>📧 Confirmation email sent</p>
            <p>🚚 We'll notify you when your order ships</p>
          </div>

          <div className="success-actions">
            <Link to="/orders" className="btn btn-primary">View My Orders</Link>
            <Link to="/products" className="btn btn-secondary">Continue Shopping</Link>
          </div>

          <div className="help-section">
            <p>Need help? Contact us at:</p>
            <p>📞 9582878282 | 📧 deepak@triokind.com</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;