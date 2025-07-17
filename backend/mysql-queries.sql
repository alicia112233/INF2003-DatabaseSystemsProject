-- This script sets up the initial database and tables for our application.

-- Comment this command below if your tables are the same!
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
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    paymentMethod VARCHAR(45) NULL,
    loyaltyPoints INT NULL DEFAULT 0,
    resetToken VARCHAR(255) NULL,
    resetTokenExpiry DATETIME NULL,
    is_Deleted CHAR(1) NOT NULL DEFAULT 'F',
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

-- All Default Password: Password1234

-- Admin account
INSERT IGNORE INTO
    game_haven.users (
        firstName,
        lastName,
        gender,
        contactNo,
        email,
        password,
        is_admin,
        avatarUrl
    )
VALUES (
        'Qwerty',
        'Tan',
        'M',
        '84738837',
        'qwerty@admin.com',
        '$2b$10$lk0vHQMPHYMtbX4BtCzJ.OCGgQ6qcSYQGOixa4Y4hEsrmNMC7P.v2',
        'T',
        '/images/profile/user-1.jpg'
    );

-- User account
INSERT IGNORE INTO
    game_haven.users (
        firstName,
        lastName,
        gender,
        contactNo,
        email,
        password,
        is_admin,
        avatarUrl
    )
VALUES (
        'alicia',
        'tang',
        'F',
        '80354633',
        'aliciatangweishan@gmail.com',
        '$2b$10$lk0vHQMPHYMtbX4BtCzJ.OCGgQ6qcSYQGOixa4Y4hEsrmNMC7P.v2',
        'F',
        '/images/profile/user-2.jpg'
    );

-- 3. Genre Table
CREATE TABLE IF NOT EXISTS Genre (
    id INT PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL
);

-- Insert Genre data
INSERT IGNORE INTO
    game_haven.Genre (id, name)
VALUES (1, 'action'),
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
CREATE TABLE IF NOT EXISTS Promotion (
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
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_promotion_startDate_endDate (startDate, endDate) VISIBLE
);

-- Insert some Promotion data
INSERT IGNORE INTO
    game_haven.Promotion (
        id,
        code,
        description,
        discountValue,
        discountType,
        maxUsage,
        startDate,
        endDate,
        isActive,
        applicableToAll
    )
VALUES (
        1,
        'BLACKFRIDAY',
        'Black Friday Sale',
        20.00,
        'percentage',
        100,
        '2023-11-24',
        '2023-11-30',
        TRUE,
        TRUE
    ),
    (
        2,
        'SUMMER2023',
        'Summer Sale 2023',
        15.00,
        'fixed',
        50,
        '2023-06-01',
        '2023-06-30',
        TRUE,
        TRUE
    );

-- 5. Game Table (references Promotion table)
CREATE TABLE IF NOT EXISTS Game (
    id INT PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    platform VARCHAR(50),
    price DECIMAL(10, 2),
    image_url VARCHAR(512),
    release_date DATE,
    is_digital BOOLEAN DEFAULT FALSE,
    stock_count INT DEFAULT 10,
    promo_id INT,
    head_image_url VARCHAR(255),
    screenshot_url VARCHAR(255),
    FOREIGN KEY (promo_id) REFERENCES Promotion (id)
    -- INDEX idx_game_promo_id (promo_id) VISIBLE,
    -- INDEX idx_game_title (title) VISIBLE
);

-- Update existing games to have stock if they currently have 0
UPDATE Game
SET
    stock_count = 10
WHERE
    stock_count = 0
    OR stock_count IS NULL;

-- 6. GameGenre Table (references Game and Genre tables)
CREATE TABLE IF NOT EXISTS GameGenre (
    game_id INT NOT NULL,
    genre_id INT NOT NULL,
    PRIMARY KEY (game_id, genre_id),
    FOREIGN KEY (game_id) REFERENCES Game (id),
    FOREIGN KEY (genre_id) REFERENCES Genre (id)
    -- UNIQUE INDEX idx_gamegenre_game_id (game_id) VISIBLE,
    -- UNIQUE INDEX idx_gamegenre_genre_id (genre_id) VISIBLE
);

-- 7. Order Table
CREATE TABLE IF NOT EXISTS Orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    total DECIMAL(10, 2) NOT NULL,
    purchase_date DATE NOT NULL,
    promotion_code VARCHAR(50) NULL,
    FOREIGN KEY (user_id) REFERENCES users (id)
    -- UNIQUE INDEX idx_orders_user_id (user_id) VISIBLE,
    -- UNIQUE INDEX idx_orders_promotion_code (promotion_code) VISIBLE
);

INSERT IGNORE INTO game_haven.Orders (id, user_id, total, purchase_date, promotion_code) VALUES
(1, 2, 5.98, '2024-06-16', NULL),
(2, 2, 45.96, '2024-07-16', NULL),
(3, 2, 21.96, '2025-06-16', NULL),
(4, 2, 45.96, '2025-07-16', NULL);

-- Join table for many-to-many Orders <-> Games
CREATE TABLE IF NOT EXISTS OrderGame (
    order_id INT NOT NULL,
    game_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    price DECIMAL(10, 2) NOT NULL,
    PRIMARY KEY (order_id, game_id),
    FOREIGN KEY (order_id) REFERENCES Orders (id) ON DELETE CASCADE,
    FOREIGN KEY (game_id) REFERENCES Game (id)
    -- UNIQUE INDEX idx_ordergame_order_id (order_id) VISIBLE,
    -- UNIQUE INDEX idx_ordergame_game_id (game_id) VISIBLE
);

-- 8. Rental Table
CREATE TABLE IF NOT EXISTS RentalRecord (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    game_id INT NOT NULL,
    depart_date DATE NOT NULL,
    return_date DATE,
    duration INT,
    returned BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES users (id),
    FOREIGN KEY (game_id) REFERENCES Game (id)
    -- UNIQUE INDEX idx_rental_user_id (user_id) VISIBLE,
    -- UNIQUE INDEX idx_rental_game_id (game_id) VISIBLE
);

-- 9. Wishlist Table
CREATE TABLE IF NOT EXISTS Wishlist (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    game_id INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id),
    FOREIGN KEY (game_id) REFERENCES Game (id),
    UNIQUE KEY unique_wishlist (user_id, game_id)
    -- UNIQUE INDEX idx_wishlist_user_id (user_id) VISIBLE,
    -- UNIQUE INDEX idx_wishlist_game_id (game_id) VISIBLE
);

-- 10. Screenshot Table
CREATE TABLE Screenshot (
  id INT AUTO_INCREMENT PRIMARY KEY,
  game_id INT NOT NULL,
  url TEXT NOT NULL,
  FOREIGN KEY (game_id) REFERENCES Game(id)
);
