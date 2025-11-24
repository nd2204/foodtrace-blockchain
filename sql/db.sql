-- =====================================================
-- FoodTrace Blockchain Database Schema (AgriTrace v3)
-- Author: Sơn Dương Hoàng & ChatGPT
-- Version: 3.0 - Production Ready
-- Date: 2025-10-22
-- =====================================================

-- ======================
-- 1. Categories
-- ======================
CREATE TABLE categories (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    description TEXT,
    created_by INT,
    updated_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ======================
-- 2. Users
-- ======================
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin', 'manufacturer')),
    full_name VARCHAR(100),
    phone VARCHAR(20),
    address TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    created_by INT NULL,
    updated_by INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE SET NULL,
    FOREIGN KEY (updated_by) REFERENCES users(user_id) ON DELETE SET NULL
);

-- ======================
-- 3. Farms
-- ======================
CREATE TABLE farms (
    farm_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    owner_name VARCHAR(150),
    contact_email VARCHAR(150),
    contact_phone VARCHAR(30),
    address TEXT,
    country_code CHAR(2),
    latitude DECIMAL(9,6),
    longitude DECIMAL(9,6),
    website VARCHAR(255),
    notes TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_by INT,
    updated_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE SET NULL,
    FOREIGN KEY (updated_by) REFERENCES users(user_id) ON DELETE SET NULL,
    UNIQUE KEY ux_farm_name_address (name(80), address(120))
);

-- ======================
-- 4. Farm Licenses / Certificates
-- ======================
CREATE TABLE farm_licenses (
    license_id INT AUTO_INCREMENT PRIMARY KEY,
    farm_id INT NOT NULL,
    license_number VARCHAR(100) NOT NULL,
    license_type VARCHAR(100), -- Ví dụ: VietGAP, Organic, GlobalGAP
    issuer VARCHAR(150),
    issue_date DATE,
    expiry_date DATE,
    status VARCHAR(30) DEFAULT 'valid' CHECK (status IN ('valid','expired','revoked','pending')),
    document_url VARCHAR(500),
    notes TEXT,
    created_by INT,
    updated_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (farm_id) REFERENCES farms(farm_id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE SET NULL,
    FOREIGN KEY (updated_by) REFERENCES users(user_id) ON DELETE SET NULL,
    UNIQUE KEY ux_farm_license (farm_id, license_number)
);

-- ======================
-- 5. Products
-- ======================
CREATE TABLE products (
    product_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    manufacturer VARCHAR(100),
    origin VARCHAR(100),
    category_id INT,
    blockchain_id VARCHAR(66),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'discontinued', 'recalled')),
    created_by INT,
    updated_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE SET NULL,
    FOREIGN KEY (updated_by) REFERENCES users(user_id) ON DELETE SET NULL
);
CREATE TABLE product_farm (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  farm_id INT NOT NULL,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY ux_product_farm (product_id, farm_id),
  FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
  FOREIGN KEY (farm_id) REFERENCES farms(farm_id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE SET NULL
);
-- ======================
-- 6. Batches
-- ======================
CREATE TABLE batches (
    batch_id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT,
    farm_id INT,
    applied_license_id INT,
    batch_number VARCHAR(50) UNIQUE NOT NULL,
    production_date DATE,
    expiry_date DATE,
    origin_type VARCHAR(50) DEFAULT 'farm' CHECK (origin_type IN ('farm','supplier','warehouse')),
    created_by INT,
    updated_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
    FOREIGN KEY (farm_id) REFERENCES farms(farm_id) ON DELETE SET NULL,
    FOREIGN KEY (applied_license_id) REFERENCES farm_licenses(license_id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE SET NULL,
    FOREIGN KEY (updated_by) REFERENCES users(user_id) ON DELETE SET NULL
);

-- ======================
-- 7. QR Codes
-- ======================
CREATE TABLE qr_codes (
    qr_id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT,
    batch_id INT,
    qr_code VARCHAR(255) UNIQUE NOT NULL,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
    FOREIGN KEY (batch_id) REFERENCES batches(batch_id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE SET NULL
);

CREATE TABLE media_files (
    media_id INT AUTO_INCREMENT PRIMARY KEY,
    entity_type ENUM('farm', 'batch', 'lab_test', 'product', 'license') NOT NULL,
    entity_id INT NOT NULL,
    file_url VARCHAR(500) NOT NULL,          -- Đường dẫn ảnh / file (VD: S3, local, IPFS)
    file_type VARCHAR(50) DEFAULT 'image',   -- image, pdf, doc, ...
    caption VARCHAR(255),                    -- mô tả ngắn (vd: "Ảnh chụp lô cà chua", "Giấy kiểm nghiệm")
    uploaded_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (uploaded_by) REFERENCES users(user_id) ON DELETE SET NULL,
    INDEX idx_media_entity (entity_type, entity_id)
);
-- ======================
-- 8. Scan Logs
-- ======================
CREATE TABLE scan_logs (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    qr_id INT,
    scan_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    device_info VARCHAR(255),
    location VARCHAR(100),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL,
    FOREIGN KEY (qr_id) REFERENCES qr_codes(qr_id) ON DELETE CASCADE
);

-- ======================
-- 9. OCR Results
-- ======================
CREATE TABLE ocr_results (
    ocr_id INT AUTO_INCREMENT PRIMARY KEY,
    qr_id INT,
    extracted_text TEXT NOT NULL,
    document_type VARCHAR(50),
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (qr_id) REFERENCES qr_codes(qr_id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE SET NULL
);

-- ======================
-- 10. Lab Tests
-- ======================
CREATE TABLE lab_tests (
    test_id INT AUTO_INCREMENT PRIMARY KEY,
    batch_id INT NOT NULL,
    test_type VARCHAR(100), -- Ví dụ: Pesticide Residue, Soil Quality, Microbial Test
    result TEXT,
    tested_by VARCHAR(150),
    test_date DATE,
    certificate_url VARCHAR(500),
    created_by INT,
    updated_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (batch_id) REFERENCES batches(batch_id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE SET NULL,
    FOREIGN KEY (updated_by) REFERENCES users(user_id) ON DELETE SET NULL
);

-- ======================



ALTER TABLE batches 
ADD COLUMN blockchain_tx VARCHAR(200),
ADD COLUMN proof_hash VARCHAR(128);
-- ======================
-- 12. Indexes for performance
-- ======================
CREATE INDEX idx_batches_farm ON batches(farm_id);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_scanlogs_user_time ON scan_logs(user_id, scan_time);
CREATE INDEX idx_farm_license_type ON farm_licenses(license_type);
CREATE INDEX idx_labtests_batch ON lab_tests(batch_id);

-- =====================================================
-- END OF SCHEMA
-- =====================================================
