-- Enable query logging and slow query analysis
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 1; -- Log queries taking more than 1 second
SET GLOBAL log_queries_not_using_indexes = 'ON';

-- Analyze rental system queries
EXPLAIN ANALYZE 
SELECT r.*, u.email, g.title, g.price 
FROM RentalRecord r
JOIN users u ON r.userEmail = u.email
JOIN Game g ON r.gameId = g.id
WHERE r.status = 'active'
ORDER BY r.rentalDate DESC;

-- Index usage analysis
SHOW INDEX FROM RentalRecord;
SHOW INDEX FROM Game;
SHOW INDEX FROM users;

-- Performance schema queries
SELECT 
    SCHEMA_NAME,
    DIGEST_TEXT,
    COUNT_STAR,
    AVG_TIMER_WAIT/1000000000 as avg_time_seconds,
    SUM_TIMER_WAIT/1000000000 as total_time_seconds
FROM performance_schema.events_statements_summary_by_digest 
WHERE SCHEMA_NAME = 'game_haven'
ORDER BY AVG_TIMER_WAIT DESC
LIMIT 10;