const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

async function addPromotionCodeColumn() {
    console.log('Adding promotion_code column to Orders table...');
    
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
            `SHOW COLUMNS FROM Orders LIKE 'promotion_code'`
        );

        if (columns.length === 0) {
            // Column doesn't exist, add it
            await connection.query(
                `ALTER TABLE Orders ADD COLUMN promotion_code VARCHAR(50) NULL`
            );
            console.log('✅ Successfully added promotion_code column to Orders table');
        } else {
            console.log('ℹ️ promotion_code column already exists in Orders table');
        }

        await connection.end();
    } catch (error) {
        console.error('❌ Error adding promotion_code column:', error);
        process.exit(1);
    }
}

addPromotionCodeColumn();
