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

async function insertOrderGameRecords(connection) {
    const orderGames = [
        { order_id: 1, game_id: 205690, quantity: 1, price: 4.99 },
        { order_id: 1, game_id: 435790, quantity: 1, price: 0.99 },
        { order_id: 2, game_id: 205690, quantity: 1, price: 4.99 },
        { order_id: 2, game_id: 793460, quantity: 1, price: 24.99 },
        { order_id: 2, game_id: 1684530, quantity: 1, price: 9.99 },
        { order_id: 2, game_id: 2006770, quantity: 1, price: 5.99 },
        { order_id: 3, game_id: 205690, quantity: 1, price: 4.99 },
        { order_id: 3, game_id: 435790, quantity: 1, price: 0.99 },
        { order_id: 3, game_id: 1684530, quantity: 1, price: 9.99 },
        { order_id: 3, game_id: 2006770, quantity: 1, price: 5.99 },
        { order_id: 4, game_id: 205690, quantity: 1, price: 4.99 },
        { order_id: 4, game_id: 793460, quantity: 1, price: 24.99 },
        { order_id: 4, game_id: 1684530, quantity: 1, price: 9.99 },
        { order_id: 4, game_id: 2006770, quantity: 1, price: 5.99 },
    ];

    for (const item of orderGames) {
        await connection.query(
            'INSERT IGNORE INTO OrderGame (order_id, game_id, quantity, price) VALUES (?, ?, ?, ?)',
            [item.order_id, item.game_id, item.quantity, item.price]
        );
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
                    null
                ]
            );
        });

        // Import Screenshots
        await importCSVtoMySQL(connection, 'screenshot', path.join('backend', 'data', 'Screenshots_Table.csv'), async (conn, row) => {
            const gameId = parseInt(row.AppID);
            const url = row.ScreenshotURL?.trim();

            if (gameId && url) {
                await conn.query(
                    'INSERT IGNORE INTO screenshot (game_id, url) VALUES (?, ?)',
                    [gameId, url]
                );
                console.log(`Inserted screenshot: game_id=${gameId}, url=${url}`);
            } else {
                console.warn(`Skipped screenshot row: AppID=${row.AppID}, ScreenshotURL=${row.ScreenshotURL}`);
            }
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

        await insertOrderGameRecords(connection);

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