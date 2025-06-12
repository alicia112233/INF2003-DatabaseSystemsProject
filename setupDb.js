const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

async function setupDatabase() {
  console.log('Setting up database...');
  
  try {
    // Create connection to MySQL server (without database)
    const connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      port: process.env.MYSQL_PORT
    });
    
    console.log('Connected to MySQL server');
    
    // Read SQL file
    const sqlFilePath = path.join(process.cwd(), 'backend', 'sample.sql');
    const sqlScript = fs.readFileSync(sqlFilePath, 'utf8');
    
    // Split SQL script into separate statements
    const statements = sqlScript
      .split(';')
      .filter(statement => statement.trim() !== '');
    
    // Execute each statement
    for (const statement of statements) {
      await connection.query(statement + ';');
    }
    
    console.log('Database setup completed successfully');
    await connection.end();
    
  } catch (error) {
    console.error('Database setup failed:', error);
    process.exit(1);
  }
}

// to actually call the function
setupDatabase();

module.exports = setupDatabase;