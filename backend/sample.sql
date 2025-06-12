-- This script sets up the initial database and tables for our application.

-- Uncomment this command below if your tables are different
DROP DATABASE IF EXISTS game_haven; 

SET profiling = 1;

CREATE DATABASE IF NOT EXISTS game_haven;
USE game_haven;

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

SELECT * FROM game_haven.users;

INSERT IGNORE INTO game_haven.users (firstName, lastName, gender, contactNo, email, password, is_admin, avatarUrl)
VALUES ('Qwerty', 'Tan', 'M', '84738837', 'qwerty@admin.com', '$2b$10$lk0vHQMPHYMtbX4BtCzJ.OCGgQ6qcSYQGOixa4Y4hEsrmNMC7P.v2', 'T', '/images/profile/user-1.jpg');

INSERT IGNORE INTO game_haven.users (firstName, lastName, gender, contactNo, email, password, is_admin, avatarUrl) 
VALUES ('alicia', 'tang', 'F', '80354633', 'aliciatangweishan@gmail.com', '$2b$10$lk0vHQMPHYMtbX4BtCzJ.OCGgQ6qcSYQGOixa4Y4hEsrmNMC7P.v2', 'F', '/images/profile/user-2.jpg');