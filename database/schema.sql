-- Trokind Pharmaceuticals Database Schema

-- Create Database
CREATE DATABASE IF NOT EXISTS trokind_pharmaceuticals;
USE trokind_pharmaceuticals;

-- Users Table
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role ENUM('customer', 'admin') DEFAULT 'customer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Categories Table
CREATE TABLE categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products Table
CREATE TABLE products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    category_id INT,
    stock_quantity INT DEFAULT 0,
    image_url VARCHAR(500),
    manufacturer VARCHAR(100),
    dosage VARCHAR(100),
    prescription_required BOOLEAN DEFAULT FALSE,
    featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- Addresses Table
CREATE TABLE addresses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    address_line1 VARCHAR(255) NOT NULL,
    address_line2 VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    country VARCHAR(100) NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Orders Table
CREATE TABLE orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    address_id INT NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    status ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
    payment_method VARCHAR(50),
    payment_status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
    razorpay_order_id VARCHAR(100),
    razorpay_payment_id VARCHAR(100),
    razorpay_signature VARCHAR(255),
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (address_id) REFERENCES addresses(id)
);

-- Order Items Table
CREATE TABLE order_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Contact Messages Table
CREATE TABLE contact_messages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    subject VARCHAR(200),
    message TEXT NOT NULL,
    status ENUM('new', 'read', 'replied') DEFAULT 'new',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Team Members Table
CREATE TABLE team_members (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    position VARCHAR(100) NOT NULL,
    bio TEXT,
    image_url VARCHAR(500),
    email VARCHAR(100),
    linkedin_url VARCHAR(200),
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert Sample Categories
INSERT INTO categories (name, description) VALUES
('Pain Relief', 'Medications for pain management and relief'),
('Antibiotics', 'Antibacterial medications for treating infections'),
('Vitamins & Supplements', 'Essential vitamins and dietary supplements'),
('Cold & Flu', 'Medications for cold and flu symptoms'),
('Digestive Health', 'Products for digestive system health'),
('Heart Health', 'Medications for cardiovascular health'),
('Diabetes Care', 'Products for diabetes management'),
('Skin Care', 'Dermatological products and treatments');

-- Insert Sample Products
INSERT INTO products (name, description, price, category_id, stock_quantity, manufacturer, dosage, prescription_required, featured) VALUES
('Paracetamol 500mg', 'Effective pain relief and fever reducer for adults and children', 12.99, 1, 500, 'Trokind Labs', '500mg tablets', FALSE, TRUE),
('Ibuprofen 400mg', 'Anti-inflammatory pain relief medication', 15.49, 1, 450, 'Trokind Labs', '400mg tablets', FALSE, TRUE),
('Amoxicillin 500mg', 'Broad-spectrum antibiotic for bacterial infections', 24.99, 2, 300, 'Trokind Pharma', '500mg capsules', TRUE, FALSE),
('Vitamin D3 1000IU', 'Essential vitamin D supplement for bone health', 18.99, 3, 800, 'Trokind Nutrition', '1000IU softgels', FALSE, TRUE),
('Multivitamin Complex', 'Complete daily multivitamin and mineral formula', 29.99, 3, 600, 'Trokind Nutrition', 'Daily tablets', FALSE, TRUE),
('Cold & Flu Relief', 'Multi-symptom cold and flu relief formula', 16.99, 4, 400, 'Trokind Care', 'Liquid suspension', FALSE, FALSE),
('Probiotic Complex', 'Advanced probiotic formula for digestive health', 34.99, 5, 250, 'Trokind Bio', '10 billion CFU', FALSE, FALSE),
('Omega-3 Fish Oil', 'High-quality omega-3 fatty acids for heart health', 27.99, 6, 500, 'Trokind Nutrition', '1000mg softgels', FALSE, TRUE),
('Metformin 500mg', 'Medication for type 2 diabetes management', 32.99, 7, 200, 'Trokind Pharma', '500mg tablets', TRUE, FALSE),
('Aspirin 75mg', 'Low-dose aspirin for cardiovascular protection', 9.99, 6, 700, 'Trokind Labs', '75mg tablets', FALSE, FALSE),
('Antihistamine 10mg', 'Relief from allergies and hay fever', 13.99, 4, 350, 'Trokind Care', '10mg tablets', FALSE, FALSE),
('Hydrocortisone Cream 1%', 'Topical treatment for skin inflammation and itching', 11.99, 8, 450, 'Trokind Derm', '1% cream', FALSE, FALSE);

-- Insert Sample Team Members
INSERT INTO team_members (name, position, bio, display_order) VALUES
('Dr. Sarah Mitchell', 'Chief Executive Officer', 'With over 20 years in pharmaceutical research, Dr. Mitchell leads Trokind with a vision for accessible healthcare.', 1),
('Dr. James Chen', 'Chief Medical Officer', 'Board-certified physician specializing in clinical research and drug development.', 2),
('Emily Rodriguez', 'Director of Operations', 'Expert in pharmaceutical supply chain management with 15 years of experience.', 3),
('Michael Anderson', 'Head of Research & Development', 'Leading innovative research in next-generation pharmaceutical solutions.', 4),
('Dr. Priya Patel', 'Quality Assurance Director', 'Ensuring the highest standards in pharmaceutical manufacturing and safety.', 5),
('David Thompson', 'Marketing Director', 'Strategic marketing professional dedicated to making healthcare accessible.', 6);

-- Insert Sample Admin User (password: admin123 - hashed with bcrypt)
-- Note: This is just a placeholder. Actual password will be hashed by the backend
INSERT INTO users (first_name, last_name, email, password, role) VALUES
('Admin', 'User', 'admin@trokind.com', '$2a$10$placeholder', 'admin');

-- Create Indexes for Better Performance
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_featured ON products(featured);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_product ON order_items(product_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_contact_status ON contact_messages(status);