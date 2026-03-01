// pages/Checkout.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useCart } from "../context/CartContext";

const API_URL = process.env.REACT_APP_API_URL;

const Checkout = () => {
  const { cartItems, getCartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    address_line1: "",
    address_line2: "",
    city: "",
    state: "",
    postal_code: "",
    country: "India",
    payment_method: "cod", // default COD
  });

  // Redirect if cart empty
  useEffect(() => {
    if (cartItems.length === 0) {
      navigate("/cart");
    }
  }, [cartItems, navigate]);

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => document.body.removeChild(script);
  }, []);

  const totalAmount = Number((getCartTotal() + 5).toFixed(2));
  const token = localStorage.getItem("token");

  // -----------------------------
  // COD ORDER
  // -----------------------------
  const handleCODOrder = async () => {
    try {
      setLoading(true);

      const payload = {
        items: cartItems.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
        })),
        shippingAddress: formData,
        paymentMethod: "cod",
        totalAmount,
      };

      const res = await axios.post(`${API_URL}/orders`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.success) {
        clearCart();
        navigate("/order-success", {
          state: { orderId: res.data.orderId },
        });
      } else {
        alert("Order failed. Please try again.");
      }
    } catch (err) {
      console.error("COD Order Error:", err);
      alert("Order failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------
  // RAZORPAY PAYMENT
  // -----------------------------
  const handleRazorpayPayment = async () => {
    try {
      setLoading(true);

      // Step 1: Create Razorpay order
      const orderRes = await axios.post(
        `${API_URL}/payment/create-order`,
        { amount: totalAmount },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const { orderId, amount, currency, keyId } = orderRes.data;

      const options = {
        key: keyId,
        amount,
        currency,
        name: "Triokind Pharmaceuticals",
        description: "Order Payment",
        order_id: orderId,
        handler: async (response) => {
          try {
            const verifyRes = await axios.post(
              `${API_URL}/payment/verify`,
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                orderDetails: {
                  items: cartItems.map((item) => ({
                    productId: item.id,
                    quantity: item.quantity,
                    price: item.price,
                    name:item.name
                  })),
                  shippingAddress: formData,
                  totalAmount,
                },
              },
              { headers: { Authorization: `Bearer ${token}` } }
            );

            if (verifyRes.data.success) {
              clearCart();
              navigate("/order-success", {
                state: {
                  orderId: verifyRes.data.orderId,
                  paymentId: response.razorpay_payment_id,
                },
              });
            } else {
              alert("Payment verification failed.");
            }
          } catch (err) {
            console.error("Payment Verify Error:", err);
            alert("Payment verification failed.");
          }
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
            alert("Payment cancelled");
          },
        },
        theme: { color: "#2c5aa0" },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err) {
      console.error("Razorpay Error:", err);
      alert("Failed to initiate payment.");
      setLoading(false);
    }
  };

  // -----------------------------
  // FORM SUBMIT
  // -----------------------------
  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      !formData.address_line1 ||
      !formData.city ||
      !formData.state ||
      !formData.postal_code
    ) {
      alert("Please fill all required fields");
      return;
    }

    if (formData.payment_method === "razorpay") {
      handleRazorpayPayment();
    } else {
      handleCODOrder();
    }
  };

  return (
    <div className="checkout-page">
      <div className="container">
        <h1>Checkout</h1>

        <form onSubmit={handleSubmit} className="checkout-form">
          <h2>Shipping Address</h2>

          <input
            placeholder="Address Line 1 *"
            value={formData.address_line1}
            onChange={(e) =>
              setFormData({ ...formData, address_line1: e.target.value })
            }
            required
          />

          <input
            placeholder="Address Line 2"
            value={formData.address_line2}
            onChange={(e) =>
              setFormData({ ...formData, address_line2: e.target.value })
            }
          />

          <input
            placeholder="City *"
            value={formData.city}
            onChange={(e) =>
              setFormData({ ...formData, city: e.target.value })
            }
            required
          />

          <input
            placeholder="State *"
            value={formData.state}
            onChange={(e) =>
              setFormData({ ...formData, state: e.target.value })
            }
            required
          />

          <input
            placeholder="PIN Code *"
            maxLength="6"
            value={formData.postal_code}
            onChange={(e) =>
              setFormData({ ...formData, postal_code: e.target.value })
            }
            required
          />

          <h2>Payment Method</h2>

          <label>
            <input
              type="radio"
              value="razorpay"
              checked={formData.payment_method === "razorpay"}
              onChange={(e) =>
                setFormData({ ...formData, payment_method: e.target.value })
              }
            />
            Pay Online (Razorpay)
          </label>

          <label>
            <input
              type="radio"
              value="cod"
              checked={formData.payment_method === "cod"}
              onChange={(e) =>
                setFormData({ ...formData, payment_method: e.target.value })
              }
            />
            Cash on Delivery
          </label>

          <button type="submit" disabled={loading}>
            {loading
              ? "Processing..."
              : formData.payment_method === "razorpay"
              ? `Pay ₹${totalAmount}`
              : `Place Order ₹${totalAmount}`}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Checkout;