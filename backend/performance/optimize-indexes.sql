-- Create optimized indexes for rental system
CREATE INDEX idx_rental_status_date ON RentalRecord(status, rentalDate);
CREATE INDEX idx_rental_user_status ON RentalRecord(userEmail, status);
CREATE INDEX idx_rental_game_status ON RentalRecord(gameId, status);
CREATE INDEX idx_game_price_stock ON Game(price, stock);
CREATE INDEX idx_users_email_active ON users(email, isActive);

-- Composite index for common rental queries
CREATE INDEX idx_rental_composite ON RentalRecord(status, userEmail, rentalDate DESC);

-- Analyze table statistics
ANALYZE TABLE RentalRecord;
ANALYZE TABLE Game;
ANALYZE TABLE users;