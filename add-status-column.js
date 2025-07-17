const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

async function addStatusColumn() {
    console.log('Adding status column to Orders table...');
    
    try {
        const connection = await mysql.createConnection({
            host: process.env.MYSQL_HOST,
            user: process.env.MYSQL_USER,
            password: process.env.MYSQL_PASSWORD,
            database: 'game_haven',
            port: Number(process.env.MYSQL_PORT) || 3306,
        });

        // Check if the column already exists
        const [columns] = await connection.query(
            `SHOW COLUMNS FROM Orders LIKE 'status'`
        );

        if (columns.length === 0) {
            // Column doesn't exist, add it
            await connection.query(
                `ALTER TABLE Orders ADD COLUMN status VARCHAR(20) DEFAULT 'Pending' AFTER total`
            );
            console.log('✅ Successfully added status column to Orders table');
            
            // Update existing orders to have a default status
            await connection.query(
                `UPDATE Orders SET status = 'Completed' WHERE status IS NULL`
            );
            console.log('✅ Updated existing orders with default status');
        } else {
            console.log('ℹ️ status column already exists in Orders table');
        }

        await connection.end();
    } catch (error) {
        console.error('❌ Error adding status column:', error);
        process.exit(1);
    }
}

addStatusColumn();
