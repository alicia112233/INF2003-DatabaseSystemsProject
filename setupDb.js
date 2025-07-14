import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { config } from 'dotenv';
import { parse } from 'csv-parse/sync';

config();

// Import the database pool using ES module syntax
let pool;
try {
    const dbModule = await import('./src/app/lib/db.js');
    pool = dbModule.pool;
} catch (error) {
    console.error('Error importing database pool:', error);
    console.error('Make sure ./src/app/lib/db.js exists and exports a pool');
    process.exit(1);
}

async function importCSVtoMySQL(connection, table, filePath, insertFn) {
    try {
        // Check if file exists
        if (!existsSync(filePath)) {
            console.warn(`CSV file not found: ${filePath}. Skipping ${table} import.`);
            return;
        }

        // console.log(`Importing ${table} from ${filePath}...`);
        const csvData = readFileSync(filePath, 'utf8');
        const records = parse(csvData, { 
            columns: true, 
            skip_empty_lines: true,
            trim: true
        });
        
        // console.log(`Found ${records.length} records in ${table}`);
        
        for (const row of records) {
            try {
                await insertFn(connection, row);
            } catch (error) {
                console.error(`Error inserting row in ${table}:`, error.message);
                // Continue with other rows
            }
        }
        
        console.log(`Successfully imported ${table}`);
    } catch (error) {
        console.error(`Error importing ${table}:`, error.message);
        throw error;
    }
}

async function setupDatabase() {
    console.log('Setting up database...');
    let connection;
    
    try {
        // Create connection to MySQL server
        connection = await pool.getConnection();
        console.log('Database connection established');

        // Check if schema file exists
        const sqlFilePath = join(process.cwd(), 'backend', 'mysql-queries.sql');
        if (!existsSync(sqlFilePath)) {
            console.error(`Schema file not found: ${sqlFilePath}`);
            console.log('Please make sure the backend/mysql-queries.sql file exists');
            return;
        }

        // Run schema
        console.log('Running database schema...');
        const sqlScript = readFileSync(sqlFilePath, 'utf8');
        const statements = sqlScript
            .split(';')
            .map(stmt => stmt.trim())
            .filter(stmt => stmt !== '' && !stmt.startsWith('--'));

        for (const statement of statements) {
            if (statement.trim()) {
                try {
                    await connection.query(statement + ';');
                } catch (error) {
                    console.warn('SQL statement warning:', error.message);
                    // Continue - some statements might be expected to fail
                }
            }
        }

        // Use the database
        await connection.query('USE game_haven;');
        // console.log('Using game_haven database');

        // Import Genre
        await importCSVtoMySQL(
            connection, 
            'Genre', 
            join(process.cwd(), 'backend', 'data', 'Genre.csv'), 
            async (conn, row) => {
                if (!row.genre_id || !row.name) {
                    console.warn('Skipping invalid genre row:', row);
                    return;
                }
                
                await conn.query(
                    'INSERT IGNORE INTO Genre (id, name) VALUES (?, ?)',
                    [parseInt(row.genre_id), row.name.trim()]
                );
            }
        );

        // Import Game
        await importCSVtoMySQL(
            connection, 
            'Game', 
            join(process.cwd(), 'backend', 'data', 'games.csv'), 
            async (conn, row) => {
                if (!row.AppID || !row.Name) {
                    console.warn('Skipping invalid game row:', row);
                    return;
                }

                const gameId = parseInt(row.AppID);
                const price = row.Price ? parseFloat(row.Price) : 0;
                let releaseDate = null;
                
                if (row.ReleaseDate && row.ReleaseDate.trim() !== '') {
                    try {
                        releaseDate = new Date(row.ReleaseDate);
                        if (isNaN(releaseDate.getTime())) {
                            releaseDate = null;
                        }
                    } catch (e) {
                        console.warn(`Invalid date format for game ${gameId}: ${row.ReleaseDate}`);
                        releaseDate = null;
                    }
                }

                await conn.query(
                    'INSERT IGNORE INTO Game (id, title, description, price, image_url, release_date, platform, stock_count) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                    [
                        gameId,
                        row.Name.trim(),
                        row.DetailedDescription || '',
                        price,
                        row.HeaderImage || '',
                        releaseDate,
                        row.Platform || null,
                        row.stock_count || 10
                    ]
                );
            }
        );

        // Import GameGenre
        await importCSVtoMySQL(
            connection, 
            'GameGenre', 
            join(process.cwd(), 'backend', 'data', 'GameGenre.csv'), 
            async (conn, row) => {
                if (!row.game_id || !row.genre_ids) {
                    console.warn('Skipping invalid game-genre row:', row);
                    return;
                }

                const game_id = parseInt(row.game_id);
                if (isNaN(game_id)) {
                    console.warn('Invalid game_id:', row.game_id);
                    return;
                }

                const genre_ids = row.genre_ids
                    .split(',')
                    .map(id => parseInt(id.trim()))
                    .filter(id => !isNaN(id));

                for (const genre_id of genre_ids) {
                    await conn.query(
                        'INSERT IGNORE INTO GameGenre (game_id, genre_id) VALUES (?, ?)',
                        [game_id, genre_id]
                    );
                }
            }
        );

        console.log('✅ Database setup and CSV import completed successfully');
        
    } catch (error) {
        console.error('❌ Database setup failed:', error.message);
        
        // More specific error messages
        if (error.code === 'ENOENT') {
            console.error('File not found. Please check that all required files exist.');
        } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            console.error('Database access denied. Please check your credentials in .env file.');
        } else if (error.code === 'ER_BAD_DB_ERROR') {
            console.error('Database does not exist. Please create the database first.');
        } else if (error.code === 'ECONNREFUSED') {
            console.error('Cannot connect to MySQL server. Please make sure MySQL is running.');
        }
        
        process.exit(1);
    } finally {
        // Always release the connection
        if (connection) {
            try {
                await connection.release();
                // console.log('Database connection released');
            } catch (e) {
                console.error('Error releasing connection:', e.message);
            }
        }
        
        // Close the pool
        try {
            await pool.end();
            // console.log('Database pool closed');
        } catch (e) {
            console.error('Error closing pool:', e.message);
        }
    }
}

// Run the setup
setupDatabase().catch(console.error);

export default setupDatabase;