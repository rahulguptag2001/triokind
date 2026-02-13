import React from 'react';

const About = () => {
  return (
    <div className="about-page">
      <div className="container">
        <h1>About Triokind Pharmaceuticals</h1>
        <div className="about-content">
          <section className="about-section">
            <h2>Our Mission</h2>
            <p>
              At Triokind Pharmaceuticals, our mission is to improve the health and well-being
              of communities worldwide by providing high-quality, affordable pharmaceutical
              products. We are committed to excellence in manufacturing, research, and customer service.
            </p>
          </section>

          <section className="about-section">
            <h2>Our History</h2>
            <p>
              Founded in 2005, Triokind Pharmaceuticals has grown from a small local pharmacy
              to a leading pharmaceutical distributor. With over 20 years of experience, we've
              built a reputation for reliability, quality, and innovation in healthcare solutions.
            </p>
          </section>

          <section className="about-section">
            <h2>Our Values</h2>
            <ul className="values-list">
              <li><strong>Quality:</strong> We maintain the highest standards in all our products</li>
              <li><strong>Integrity:</strong> We conduct business with honesty and transparency</li>
              <li><strong>Innovation:</strong> We continuously seek better healthcare solutions</li>
              <li><strong>Accessibility:</strong> We make healthcare affordable for everyone</li>
            </ul>
          </section>

          <section className="about-section">
            <h2>Why Choose Us?</h2>
            <div className="why-choose-grid">
              <div className="why-choose-item">
                <h3>✓ Certified Products</h3>
                <p>All products meet international quality standards</p>
              </div>
              <div className="why-choose-item">
                <h3>✓ Expert Team</h3>
                <p>Qualified pharmacists and healthcare professionals</p>
              </div>
              <div className="why-choose-item">
                <h3>✓ Fast Delivery</h3>
                <p>Quick and reliable shipping nationwide</p>
              </div>
              <div className="why-choose-item">
                <h3>✓ Customer Support</h3>
                <p>24/7 support for all your inquiries</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default About;