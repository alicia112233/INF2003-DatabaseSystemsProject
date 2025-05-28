-- This script sets up the initial database and tables for our application.

-- Uncomment this command below if your tables are different
-- DROP DATABASE IF EXISTS game_haven; 

SET profiling = 1;

CREATE DATABASE IF NOT EXISTS game_haven;
USE game_haven;

CREATE TABLE customers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  firstName VARCHAR(255) NOT NULL,
  lastName VARCHAR(255) NOT NULL,
  gender CHAR(1) NOT NULL,
  contactNo VARCHAR(20) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  avatarUrl VARCHAR(255),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER set_default_avatar_customers
BEFORE INSERT ON customers
FOR EACH ROW
SET NEW.avatarUrl = 
  CASE
    WHEN (NEW.avatarUrl IS NULL OR NEW.avatarUrl = '') AND NEW.gender = 'F' THEN '/images/profile/user-2.jpg'
    WHEN (NEW.avatarUrl IS NULL OR NEW.avatarUrl = '') AND NEW.gender = 'M' THEN '/images/profile/user-1.jpg'
    ELSE NEW.avatarUrl
  END;

SELECT * FROM game_haven.customers;

-- DEFAULT PASSWORD: 'password123' UNHASHED 

INSERT IGNORE INTO game_haven.customers (firstName, lastName, gender, contactNo, email, password, createdAt)
VALUES 
('Wendy', 'Tan', 'F', '81232313', 'test@gmail.com', '$2b$10$vi4bWxn67DlbmL4KpqGaQeyL9NwH53j23DAhpCVz/SW75mLV1GuFO', CURRENT_TIMESTAMP),
('Richard', 'Lee', 'M', '94828873', 'test2@gmail.com', '$2b$10$vi4bWxn67DlbmL4KpqGaQeyL9NwH53j23DAhpCVz/SW75mLV1GuFO', CURRENT_TIMESTAMP);

CREATE TABLE admin (
  id INT AUTO_INCREMENT PRIMARY KEY,
  firstName VARCHAR(255) NOT NULL,
  lastName VARCHAR(255) NOT NULL,
  gender CHAR(1) NOT NULL,
  role VARCHAR(45) NOT NULL,
  contactNo VARCHAR(10) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  avatarUrl VARCHAR(255) DEFAULT '/images/profile/user-1.jpg',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER set_default_avatar_admin
BEFORE INSERT ON admin
FOR EACH ROW
SET NEW.avatarUrl = 
  CASE
    WHEN (NEW.avatarUrl IS NULL OR NEW.avatarUrl = '') AND NEW.gender = 'F' THEN '/images/profile/user-2.jpg'
    WHEN (NEW.avatarUrl IS NULL OR NEW.avatarUrl = '') AND NEW.gender = 'M' THEN '/images/profile/user-1.jpg'
    ELSE NEW.avatarUrl
  END;

SELECT * FROM game_haven.admin;

INSERT IGNORE INTO game_haven.admin (firstName, lastName, gender, role, contactNo, email, password, createdAt)
VALUES ('Alicia', 'Tang', 'F', 'Store Assistant', '98302251', 'alicia@admin.com', '$2b$10$vi4bWxn67DlbmL4KpqGaQeyL9NwH53j23DAhpCVz/SW75mLV1GuFO', CURRENT_TIMESTAMP);