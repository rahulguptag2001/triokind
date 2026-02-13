// pages/Checkout.js - Checkout with Razorpay Integration
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const Checkout = () => {
  const { cartItems, getCartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'India',
    payment_method: 'razorpay'
  });

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleRazorpayPayment = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const totalAmount = getCartTotal() + 5; // Including shipping

      // Step 1: Create Razorpay order on backend
      const orderResponse = await axios.post(
        `${API_URL}/payment/create-order`,
        { amount: totalAmount },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const { orderId, amount, currency, keyId } = orderResponse.data;

      // Step 2: Open Razorpay checkout
      const options = {
        key: keyId,
        amount: amount,
        currency: currency,
        name: 'Triokind Pharmaceuticals',
        description: 'Order Payment',
        order_id: orderId,
        handler: async function (response) {
          // Step 3: Verify payment on backend
          try {
            const verifyResponse = await axios.post(
              `${API_URL}/payment/verify`,
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                orderDetails: {
                  items: cartItems.map(item => ({
                    productId: item.id,
                    quantity: item.quantity
                  })),
                  shippingAddress: formData,
                  totalAmount: totalAmount
                }
              },
              { headers: { Authorization: `Bearer ${token}` } }
            );

            if (verifyResponse.data.success) {
              clearCart();
              navigate('/order-success', { 
                state: { 
                  orderId: verifyResponse.data.orderId,
                  paymentId: response.razorpay_payment_id
                } 
              });
            } else {
              alert('Payment verification failed. Please contact support.');
            }
          } catch (error) {
            console.error('Verification error:', error);
            alert('Payment verification failed. Please contact support with payment ID: ' + response.razorpay_payment_id);
          }
        },
        prefill: {
          name: '',
          email: '',
          contact: ''
        },
        notes: {
          address: `${formData.address_line1}, ${formData.city}`
        },
        theme: {
          color: '#2c5aa0'
        },
        modal: {
          ondismiss: function() {
            setLoading(false);
            alert('Payment cancelled');
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
      setLoading(false);

    } catch (error) {
      console.error('Payment error:', error);
      alert('Failed to initiate payment. Please try again.');
      setLoading(false);
    }
  };

  const handleCODOrder = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const orderData = {
        items: cartItems.map(item => ({
          productId: item.id,
          quantity: item.quantity
        })),
        shippingAddress: formData,
        paymentMethod: 'cod'
      };

      await axios.post(`${API_URL}/orders`, orderData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      clearCart();
      navigate('/order-success');
    } catch (error) {
      alert('Order failed. Please try again.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    if (!formData.address_line1 || !formData.city || !formData.state || !formData.postal_code) {
      alert('Please fill all required fields');
      return;
    }

    // Process payment based on selected method
    if (formData.payment_method === 'razorpay') {
      await handleRazorpayPayment();
    } else if (formData.payment_method === 'cod') {
      await handleCODOrder();
    }
  };

  if (cartItems.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="checkout-page">
      <div className="container">
        <h1>Checkout</h1>
        <div className="checkout-content">
          <form onSubmit={handleSubmit} className="checkout-form">
            <h2>Shipping Address</h2>
            <div className="form-group">
              <label>Address Line 1 *</label>
              <input
                type="text"
                value={formData.address_line1}
                onChange={(e) => setFormData({...formData, address_line1: e.target.value})}
                required
                placeholder="House/Flat No., Building Name"
              />
            </div>
            <div className="form-group">
              <label>Address Line 2</label>
              <input
                type="text"
                value={formData.address_line2}
                onChange={(e) => setFormData({...formData, address_line2: e.target.value})}
                placeholder="Area, Street, Sector, Village"
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>City *</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({...formData, city: e.target.value})}
                  required
                  placeholder="City"
                />
              </div>
              <div className="form-group">
                <label>State *</label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => setFormData({...formData, state: e.target.value})}
                  required
                  placeholder="State"
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>PIN Code *</label>
                <input
                  type="text"
                  value={formData.postal_code}
                  onChange={(e) => setFormData({...formData, postal_code: e.target.value})}
                  required
                  placeholder="6-digit PIN code"
                  maxLength="6"
                />
              </div>
              <div className="form-group">
                <label>Country *</label>
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) => setFormData({...formData, country: e.target.value})}
                  required
                />
              </div>
            </div>

            <h2>Payment Method</h2>
            <div className="payment-methods">
              <label className="payment-option">
                <input
                  type="radio"
                  name="payment"
                  value="razorpay"
                  checked={formData.payment_method === 'razorpay'}
                  onChange={(e) => setFormData({...formData, payment_method: e.target.value})}
                />
                <div className="payment-option-content">
                  <strong>💳 Pay Online (Razorpay)</strong>
                  <p>UPI, Cards, Net Banking, Wallets</p>
                </div>
              </label>

              <label className="payment-option">
                <input
                  type="radio"
                  name="payment"
                  value="cod"
                  checked={formData.payment_method === 'cod'}
                  onChange={(e) => setFormData({...formData, payment_method: e.target.value})}
                />
                <div className="payment-option-content">
                  <strong>💵 Cash on Delivery</strong>
                  <p>Pay when you receive the order</p>
                </div>
              </label>
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary btn-large">
              {loading ? 'Processing...' : 
               formData.payment_method === 'razorpay' 
                 ? `Pay ₹${(getCartTotal() + 5).toFixed(2)}` 
                 : `Place Order - ₹${(getCartTotal() + 5).toFixed(2)}`
              }
            </button>

            <div className="secure-payment">
              <p>🔒 100% Secure Payment</p>
              {formData.payment_method === 'razorpay' && (
                <div className="payment-logos">
                  <span>Visa</span> | <span>Mastercard</span> | <span>UPI</span> | <span>NetBanking</span>
                </div>
              )}
            </div>
          </form>

          <div className="order-summary">
            <h2>Order Summary</h2>
            {cartItems.map(item => (
              <div key={item.id} className="summary-item">
                <span>{item.name} x {item.quantity}</span>
                <span>₹{(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className="summary-item">
              <span>Subtotal</span>
              <span>₹{getCartTotal().toFixed(2)}</span>
            </div>
            <div className="summary-item">
              <span>Shipping</span>
              <span>₹5.00</span>
            </div>
            <div className="summary-total">
              <span>Total</span>
              <span>₹{(getCartTotal() + 5).toFixed(2)}</span>
            </div>

            <div className="order-info">
              <h3>Why Triokind?</h3>
              <ul>
                <li>✓ Genuine medicines</li>
                <li>✓ Fast delivery</li>
                <li>✓ Easy returns</li>
                <li>✓ 24/7 support</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;