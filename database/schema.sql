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
IINSERT INTO products (name, description, price, category_id, manufacturer, dosage, stock_quantity, image_url, prescription_required, featured) VALUES
('Welcon Junior', 'Effective Pediatric Cough & Cold Syrup with Dextromethorphan, Phenylephrine and Chlorpheniramine', 1.00, 1, 'Triokind Pharmaceutical', '60ml', 100, 'UPLOAD_IMAGE_VIA_ADMIN', 0, 1),
('Ibuzaal Suspension', 'Ibuprofen & Paracetamol Oral Suspension - Rapid Relief from Fever, Pain & Discomfort', 1.00, 2, 'Triokind Pharmaceutical', '60ml', 100, 'UPLOAD_IMAGE_VIA_ADMIN', 0, 1),
('Rebtom-DSR', 'Rabeprazole & Domperidone Capsules - Fast Relief from Acid Reflux & Dyspepsia', 1.00, 3, 'Triokind Pharmaceutical', '20 Capsules', 100, 'UPLOAD_IMAGE_VIA_ADMIN', 1, 1),
('Taskmol-MF', 'Mefenamic Acid & Paracetamol Oral Suspension - Quick Relief from Fever & Pain in Children', 1.00, 2, 'Triokind Pharmaceutical', '60ml', 100, 'UPLOAD_IMAGE_VIA_ADMIN', 0, 1),
('Taskmol-Junior', 'Mefenamic Acid & Paracetamol Suspension - Fast Relief from Fever & Pain', 1.00, 2, 'Triokind Pharmaceutical', '60ml', 100, 'UPLOAD_IMAGE_VIA_ADMIN', 0, 1),
('Taskmol-Plus', 'Aceclofenac & Paracetamol Tablets - Powerful Relief From Pain & Inflammation', 1.00, 2, 'Triokind Pharmaceutical', '20 Tablets', 100, 'UPLOAD_IMAGE_VIA_ADMIN', 1, 0),
('Taskmol-SP', 'Aceclofenac, Paracetamol & Serratiopeptidase - Effective Relief from Pain and Inflammation', 1.00, 2, 'Triokind Pharmaceutical', '10 Tablets', 100, 'UPLOAD_IMAGE_VIA_ADMIN', 1, 0),
('Pinzyme Syrup', 'Fungal Diastase, Pepsin & Digestive Enzymes - Promotes Better Digestion', 1.00, 4, 'Triokind Pharmaceutical', '200ml', 100, 'UPLOAD_IMAGE_VIA_ADMIN', 0, 1),
('Bougain 4G', 'Omega-3 Fatty Acids, Green Tea Extract & Multivitamin Softgel Capsules', 1.00, 5, 'Triokind Pharmaceutical', '100 Capsules', 100, 'UPLOAD_IMAGE_VIA_ADMIN', 0, 1),
('Bougain Softgel', 'Ginseng, Multivitamin & Antioxidant Softgel Capsules', 1.00, 5, 'Triokind Pharmaceutical', '100 Capsules', 100, 'UPLOAD_IMAGE_VIA_ADMIN', 0, 0),
('Bougain Gold', 'Lycopene, Multivitamin & Antioxidant Softgel Capsules', 1.00, 5, 'Triokind Pharmaceutical', '100 Capsules', 100, 'UPLOAD_IMAGE_VIA_ADMIN', 0, 0),
('Aptibon Syrup', 'Cyproheptadine Appetite Stimulant Syrup - Strawberry Flavor', 1.00, 6, 'Triokind Pharmaceutical', '200ml', 100, 'UPLOAD_IMAGE_VIA_ADMIN', 0, 1),
('Hepatask Syrup', 'L-Ornithine L-Aspartate Liver Health Syrup - Mango Flavor', 1.00, 7, 'Triokind Pharmaceutical', '200ml', 100, 'UPLOAD_IMAGE_VIA_ADMIN', 1, 0),
('Holimentin-625', 'Amoxycillin & Potassium Clavulanate Tablets - Antibiotic', 1.00, 8, 'Triokind Pharmaceutical', '100 Tablets', 100, 'UPLOAD_IMAGE_VIA_ADMIN', 1, 0),
('Platogreat Syrup', 'Ayurvedic Probiotic Digestive Health Syrup', 1.00, 4, 'Triokind Pharmaceutical', '500ml', 100, 'UPLOAD_IMAGE_VIA_ADMIN', 0, 0),
('Walcon Syrup', 'Phenylephrine HCl & Chlorpheniramine Maleate - Orange Flavor', 1.00, 1, 'Triokind Pharmaceutical', '60ml', 100, 'UPLOAD_IMAGE_VIA_ADMIN', 0, 0),
('Electrogreat Energy', 'Instant Energy Booster with Vitamin C & Electrolytes - Orange Flavor', 1.00, 5, 'Triokind Pharmaceutical', '100gm', 100, 'UPLOAD_IMAGE_VIA_ADMIN', 0, 0),
('Ibuzaal 60ml', 'Ibuprofen & Paracetamol Suspension - Strawberry Flavor', 1.00, 2, 'Triokind Pharmaceutical', '60ml', 100, 'UPLOAD_IMAGE_VIA_ADMIN', 0, 0);

-- Insert Sample Team Members
INSERT INTO team_members (name, position, bio, display_order) VALUES
('Deepak Narayan', 'Chief Executive Officer', '.', 1),

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