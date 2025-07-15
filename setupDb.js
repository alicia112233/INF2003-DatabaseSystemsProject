const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const { parse } = require('csv-parse/sync');

dotenv.config();

async function importCSVtoMySQL(connection, table, filePath, insertFn) {
    const csvData = fs.readFileSync(filePath, 'utf8');
    const records = parse(csvData, { columns: true, skip_empty_lines: true });
    for (const row of records) {
        await insertFn(connection, row);
    }
}

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

        // Run schema
        const sqlFilePath = path.join(process.cwd(), 'backend', 'sample.sql');
        const sqlScript = fs.readFileSync(sqlFilePath, 'utf8');
        const statements = sqlScript.split(';').filter(statement => statement.trim() !== '');
        for (const statement of statements) {
            await connection.query(statement + ';');
        }

        // Now use the database
        await connection.query('USE game_haven;');

        // Import Genre
        await importCSVtoMySQL(connection, 'Genre', path.join('backend', 'data', 'Genre.csv'), async (conn, row) => {
            await conn.query(
                'INSERT IGNORE INTO Genre (id, name) VALUES (?, ?)',
                [parseInt(row.genre_id), row.name]
            );
        });

        // Import Game
        await importCSVtoMySQL(connection, 'Game', path.join('backend', 'data', 'games.csv'), async (conn, row) => {
            await conn.query(
                'INSERT IGNORE INTO Game (id, title, description, price, image_url, release_date, platform) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [
                    parseInt(row.AppID),
                    row.Name,
                    row.DetailedDescription,
                    parseFloat(row.Price) || 0,
                    row.HeaderImage,
                    row.ReleaseDate && row.ReleaseDate !== '' ? new Date(row.ReleaseDate) : null,
                    null // platform (if you have it in your CSV, replace null with row.Platform)
                ]
            );
        });

        // Import GameGenre
        await importCSVtoMySQL(connection, 'GameGenre', path.join('backend', 'data', 'GameGenre.csv'), async (conn, row) => {
            const game_id = parseInt(row.game_id);
            const genre_ids = row.genre_ids.split(',').map(id => parseInt(id.trim()));
            for (const genre_id of genre_ids) {
                await conn.query(
                    'INSERT IGNORE INTO GameGenre (game_id, genre_id) VALUES (?, ?)',
                    [game_id, genre_id]
                );
            }
        });

        console.log('Database setup and CSV import completed successfully');
        await connection.end();
    } catch (error) {
        console.error('Database setup failed:', error);
        process.exit(1);
    }
}

// to actually call the function
setupDatabase();

module.exports = setupDatabase;