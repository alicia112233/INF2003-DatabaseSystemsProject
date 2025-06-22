-- This script sets up the initial database and tables for our application.

-- Uncomment this command below if your tables are different
DROP DATABASE IF EXISTS game_haven; 

SET profiling = 1;

-- 1. Create the database
CREATE DATABASE IF NOT EXISTS game_haven;
USE game_haven;

-- 2. Users table
CREATE TABLE IF NOT EXISTS users (
  id INT NOT NULL AUTO_INCREMENT,
  firstName VARCHAR(100) NOT NULL,
  lastName VARCHAR(100) NOT NULL,
  gender CHAR(1) NOT NULL,
  contactNo VARCHAR(20) NOT NULL,
  email VARCHAR(200) NOT NULL,
  password VARCHAR(200) NOT NULL,
  is_admin CHAR(1) NOT NULL DEFAULT 'F',
  avatarUrl VARCHAR(200) NOT NULL,
  createdAt VARCHAR(45) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  paymentMethod VARCHAR(45) NULL,
  loyaltyPoints INT NULL DEFAULT 0,
  resetToken VARCHAR(255) NULL,
  resetTokenExpiry DATETIME NULL,
  PRIMARY KEY (id),
  UNIQUE INDEX email_UNIQUE (email ASC) VISIBLE,
  UNIQUE INDEX id_UNIQUE (id ASC) VISIBLE
);

DROP TRIGGER IF EXISTS set_default_avatar_users;

CREATE TRIGGER set_default_avatar_users
BEFORE INSERT ON users
FOR EACH ROW
SET NEW.avatarUrl = 
  CASE
    WHEN (NEW.avatarUrl IS NULL OR NEW.avatarUrl = '') AND NEW.gender = 'F' THEN '/images/profile/user-2.jpg'
    WHEN (NEW.avatarUrl IS NULL OR NEW.avatarUrl = '') AND NEW.gender = 'M' THEN '/images/profile/user-1.jpg'
    ELSE NEW.avatarUrl
  END;

-- Default password: Password1234
INSERT IGNORE INTO game_haven.users (firstName, lastName, gender, contactNo, email, password, is_admin, avatarUrl)
VALUES ('Qwerty', 'Tan', 'M', '84738837', 'qwerty@admin.com', '$2b$10$lk0vHQMPHYMtbX4BtCzJ.OCGgQ6qcSYQGOixa4Y4hEsrmNMC7P.v2', 'T', '/images/profile/user-1.jpg');

INSERT IGNORE INTO game_haven.users (firstName, lastName, gender, contactNo, email, password, is_admin, avatarUrl) 
VALUES ('alicia', 'tang', 'F', '80354633', 'aliciatangweishan@gmail.com', '$2b$10$lk0vHQMPHYMtbX4BtCzJ.OCGgQ6qcSYQGOixa4Y4hEsrmNMC7P.v2', 'F', '/images/profile/user-2.jpg');

-- 3. Genre Table
CREATE TABLE Genre (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL
);

-- Insert Genre data
INSERT IGNORE INTO game_haven.Genre (id, name) VALUES
(1, 'action'),
(2, 'adventure'),
(3, 'animation modeling'),
(4, 'audio production'),
(5, 'casual'),
(6, 'design illustration'),
(7, 'early access'),
(8, 'education'),
(9, 'free to play'),
(10, 'game development'),
(11, 'gore'),
(12, 'indie'),
(13, 'massively multiplayer'),
(14, 'nudity'),
(15, 'photo editing'),
(16, 'racing'),
(17, 'rpg'),
(18, 'sexual content'),
(19, 'simulation'),
(20, 'software training'),
(21, 'sports'),
(22, 'strategy'),
(23, 'survival'),
(24, 'utilities'),
(25, 'video production'),
(26, 'violent'),
(27, 'web publishing');

-- 4. Promotion Table
CREATE TABLE Promotion (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(255) NOT NULL,
    discountValue DECIMAL(10, 2) NOT NULL,
    discountType ENUM('percentage', 'fixed') NOT NULL DEFAULT 'fixed',
    maxUsage INT DEFAULT NULL,
    usedCount INT DEFAULT 0,
    startDate DATE NOT NULL,
    endDate DATE NOT NULL,
    isActive BOOLEAN DEFAULT TRUE,
    applicableToAll BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert Promotion data
INSERT IGNORE INTO game_haven.Promotion (id, code, description, discountValue, discountType, maxUsage, startDate, endDate, isActive, applicableToAll) VALUES
(1, 'BLACKFRIDAY', 'Black Friday Sale', 20.00, 'percentage', 100, '2023-11-24', '2023-11-30', TRUE, TRUE),
(2, 'SUMMER2023', 'Summer Sale 2023', 15.00, 'fixed', 50, '2023-06-01', '2023-06-30', TRUE, TRUE);

-- 5. Game Table (references Promotion table)
CREATE TABLE Game (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    platform VARCHAR(50),
    price DECIMAL(10,2),
    release_date DATE,
    is_digital BOOLEAN DEFAULT FALSE,
    stock_count INT DEFAULT 0,
    promo_id INT,
    head_image_url VARCHAR(255),
    screenshot_url VARCHAR(255),
    FOREIGN KEY (promo_id) REFERENCES Promotion(id)
);

-- Insert Game data
INSERT IGNORE INTO game_haven.Game (id, title, platform, price, release_date, is_digital, stock_count, promo_id, head_image_url, screenshot_url) VALUES
(1, 'Game Title 1', 'PC', 59.99, '2023-01-01', TRUE, 100, 1, '/images/products/WW.jpg', '/images/products/game1_screenshot.jpg'),
(2, 'Game Title 2', 'Console', 49.99, '2023-02-01', FALSE, 50, 2, '/images/products/OH.jpg', '/images/products/game2_screenshot.jpg');

-- 6. GameGenre Table (references Game and Genre tables)
CREATE TABLE GameGenre (
    game_id INT NOT NULL,
    genre_id INT NOT NULL,
    PRIMARY KEY (game_id, genre_id),
    FOREIGN KEY (game_id) REFERENCES Game(id),
    FOREIGN KEY (genre_id) REFERENCES Genre(id)
);

-- 7. Order Table
CREATE TABLE Orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    purchase_date DATE NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 8. Rental Table
CREATE TABLE RentalRecord (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    game_id INT NOT NULL,
    depart_date DATE NOT NULL,
    return_date DATE,
    duration INT,
    returned BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (game_id) REFERENCES Game(id)
);