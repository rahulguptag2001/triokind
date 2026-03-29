// utils/emailService.js
import nodemailer from "nodemailer";

// ─────────────────────────────────────────────────────────────────────────────
// Transporter — Gmail SMTP
// Set GMAIL_USER and GMAIL_APP_PASSWORD in your Render environment variables.
// To get an App Password:
//   Google Account → Security → 2-Step Verification → App Passwords
// ─────────────────────────────────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

/**
 * sendOrderNotification
 *
 * Sends an order summary email to the admin (you).
 *
 * @param {Object} params
 * @param {number}  params.orderId
 * @param {string}  params.customerName
 * @param {string}  params.customerEmail
 * @param {Object}  params.shippingAddress
 * @param {Array}   params.items           — [{ name, quantity, price }]
 * @param {number}  params.totalAmount
 * @param {string}  params.paymentMethod   — 'cod' | 'razorpay'
 * @param {string}  params.paymentStatus   — 'pending' | 'completed'
 * @param {string}  [params.razorpayPaymentId]
 * @param {Date}    params.timestamp
 */
export const sendOrderNotification = async ({
  orderId,
  customerName,
  customerEmail,
  shippingAddress,
  items,
  totalAmount,
  paymentMethod,
  paymentStatus,
  razorpayPaymentId,
  timestamp,
}) => {
  try {
    const formattedDate = new Date(timestamp).toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      dateStyle: "full",
      timeStyle: "short",
    });

    const addressText = [
      shippingAddress.address_line1,
      shippingAddress.address_line2,
      shippingAddress.city,
      shippingAddress.state,
      shippingAddress.postal_code,
      shippingAddress.country || "India",
    ]
      .filter(Boolean)
      .join(", ");

    // Build product rows for the table
    const productRows = items
      .map(
        (item) => `
        <tr>
          <td style="padding:10px 12px; border-bottom:1px solid #f0f0f0;">${item.name}</td>
          <td style="padding:10px 12px; border-bottom:1px solid #f0f0f0; text-align:center;">${item.quantity}</td>
          <td style="padding:10px 12px; border-bottom:1px solid #f0f0f0; text-align:right;">₹${Number(item.price).toFixed(2)}</td>
          <td style="padding:10px 12px; border-bottom:1px solid #f0f0f0; text-align:right;">₹${(Number(item.price) * item.quantity).toFixed(2)}</td>
        </tr>`
      )
      .join("");

    const paymentBadgeColor =
      paymentMethod === "razorpay" ? "#22c55e" : "#f59e0b";
    const paymentLabel =
      paymentMethod === "razorpay"
        ? "Online Payment (Razorpay)"
        : "Cash on Delivery (COD)";

    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0; padding:0; background:#f4f6f9; font-family: 'Segoe UI', Arial, sans-serif;">

  <div style="max-width:620px; margin:30px auto; background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 4px 20px rgba(0,0,0,0.08);">

    <!-- Header -->
    <div style="background:linear-gradient(135deg, #2c5aa0, #1a3f7a); padding:32px 36px;">
      <h1 style="margin:0; color:#ffffff; font-size:22px; font-weight:700;">
        ⚕ Triokind Pharmaceuticals
      </h1>
      <p style="margin:6px 0 0; color:#a8c4e8; font-size:14px;">New Order Notification</p>
    </div>

    <!-- Order ID Banner -->
    <div style="background:#eef4ff; padding:16px 36px; border-bottom:1px solid #dbe8ff;">
      <p style="margin:0; font-size:15px; color:#2c5aa0;">
        <strong>Order #${orderId}</strong> &nbsp;·&nbsp;
        <span style="color:#555;">${formattedDate}</span>
      </p>
    </div>

    <div style="padding:28px 36px;">

      <!-- Customer -->
      <h2 style="margin:0 0 14px; font-size:15px; text-transform:uppercase; letter-spacing:0.5px; color:#888;">Customer Details</h2>
      <table style="width:100%; font-size:14px; color:#333; margin-bottom:28px;">
        <tr>
          <td style="padding:4px 0; width:140px; color:#666;">Name</td>
          <td style="padding:4px 0;"><strong>${customerName}</strong></td>
        </tr>
        <tr>
          <td style="padding:4px 0; color:#666;">Email</td>
          <td style="padding:4px 0;">${customerEmail}</td>
        </tr>
      </table>

      <!-- Shipping Address -->
      <h2 style="margin:0 0 14px; font-size:15px; text-transform:uppercase; letter-spacing:0.5px; color:#888;">Shipping Address</h2>
      <p style="margin:0 0 28px; font-size:14px; color:#333; line-height:1.7; background:#f9f9f9; padding:14px 16px; border-radius:8px; border-left:4px solid #2c5aa0;">
        📍 ${addressText}
      </p>

      <!-- Products -->
      <h2 style="margin:0 0 14px; font-size:15px; text-transform:uppercase; letter-spacing:0.5px; color:#888;">Products Ordered</h2>
      <table style="width:100%; border-collapse:collapse; font-size:14px; margin-bottom:28px;">
        <thead>
          <tr style="background:#f4f6f9;">
            <th style="padding:10px 12px; text-align:left; color:#555; font-weight:600;">Product</th>
            <th style="padding:10px 12px; text-align:center; color:#555; font-weight:600;">Qty</th>
            <th style="padding:10px 12px; text-align:right; color:#555; font-weight:600;">Price</th>
            <th style="padding:10px 12px; text-align:right; color:#555; font-weight:600;">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          ${productRows}
        </tbody>
        <tfoot>
          <tr style="background:#f4f6f9;">
            <td colspan="3" style="padding:12px; text-align:right; font-weight:700; color:#333;">Total Amount</td>
            <td style="padding:12px; text-align:right; font-weight:700; color:#2c5aa0; font-size:16px;">₹${Number(totalAmount).toFixed(2)}</td>
          </tr>
        </tfoot>
      </table>

      <!-- Payment -->
      <h2 style="margin:0 0 14px; font-size:15px; text-transform:uppercase; letter-spacing:0.5px; color:#888;">Payment</h2>
      <table style="width:100%; font-size:14px; color:#333; margin-bottom:8px;">
        <tr>
          <td style="padding:4px 0; width:140px; color:#666;">Method</td>
          <td style="padding:4px 0;">
            <span style="background:${paymentBadgeColor}; color:#fff; padding:3px 10px; border-radius:20px; font-size:12px; font-weight:600;">
              ${paymentLabel}
            </span>
          </td>
        </tr>
        <tr>
          <td style="padding:4px 0; color:#666;">Status</td>
          <td style="padding:4px 0; font-weight:600; color:${paymentStatus === "completed" ? "#22c55e" : "#f59e0b"};">
            ${paymentStatus.toUpperCase()}
          </td>
        </tr>
        ${
          razorpayPaymentId
            ? `<tr>
          <td style="padding:4px 0; color:#666;">Payment ID</td>
          <td style="padding:4px 0; font-family:monospace; color:#555;">${razorpayPaymentId}</td>
        </tr>`
            : ""
        }
      </table>

    </div>

    <!-- Footer -->
    <div style="background:#f4f6f9; padding:18px 36px; text-align:center; border-top:1px solid #e8e8e8;">
      <p style="margin:0; font-size:12px; color:#999;">
        This is an automated notification from Triokind Pharmaceuticals.<br>
        © ${new Date().getFullYear()} Triokind Pharmaceuticals Pvt. Ltd.
      </p>
    </div>

  </div>
</body>
</html>`;

    await transporter.sendMail({
      from: `"Triokind Orders" <${process.env.GMAIL_USER}>`,
      to: process.env.ADMIN_EMAIL || process.env.GMAIL_USER,
      subject: `🛒 New Order #${orderId} — ₹${Number(totalAmount).toFixed(2)} (${paymentLabel})`,
      html,
    });

    console.log(`✅ Order notification email sent for Order #${orderId}`);
  } catch (error) {
    // Never crash the order flow because of email failure
    console.error("❌ Failed to send order notification email:", error.message);
  }
};