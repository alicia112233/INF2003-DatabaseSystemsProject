import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  port: Number(process.env.MYSQL_PORT),
  database: process.env.MYSQL_DATABASE,
};

function toTitleCase(str: string) {
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function capitalizeFirstLetterOfParagraphs(str: string) {
  if (!str) return str;

  return str
    .split(/(\n\s*\n|\r\n\s*\r\n|\n|\r\n|\.  |\.   )/)
    .map(paragraph => {
      const trimmed = paragraph.trim();
      if (trimmed.length === 0) return paragraph;
      return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
    })
    .join('');
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const genreId = searchParams.get('genre');
    const searchTerm = searchParams.get('search');
    const stockFilter = searchParams.get('stock');

    const pool = mysql.createPool(dbConfig);
    const connection = await pool.getConnection();

    let query = `
      SELECT 
        g.*,
        GROUP_CONCAT(DISTINCT gg.genre_id) as genre_ids,
        GROUP_CONCAT(DISTINCT gen.name) as genre_names
      FROM game g
      LEFT JOIN gamegenre gg ON g.id = gg.game_id
      LEFT JOIN genre gen ON gg.genre_id = gen.id
    `;

    const queryParams: any[] = [];

    if (genreId || searchTerm || stockFilter) {
      query = `
        SELECT 
          g.*,
          GROUP_CONCAT(DISTINCT gg.genre_id) as genre_ids,
          GROUP_CONCAT(DISTINCT gen.name) as genre_names
        FROM game g
        LEFT JOIN gamegenre gg ON g.id = gg.game_id
        LEFT JOIN genre gen ON gg.genre_id = gen.id
        WHERE g.id IN (
          SELECT DISTINCT g2.id
          FROM game g2
          LEFT JOIN gamegenre gg2 ON g2.id = gg2.game_id
          WHERE 1=1
      `;

      if (genreId) {
        query += ' AND gg2.genre_id = ?';
        queryParams.push(parseInt(genreId));
      }

      if (searchTerm) {
        query += ' AND (g2.title LIKE ? OR g2.description LIKE ?)';
        queryParams.push(`%${searchTerm}%`, `%${searchTerm}%`);
      }

      if (stockFilter === 'inStock') {
        query += ' AND g2.stock_count = 1';
      } else if (stockFilter === 'outOfStock') {
        query += ' AND g2. = 0';
      }

      query += ')';
    }

    query += ' GROUP BY g.id ORDER BY g.title ASC';

    const [rows] = await connection.execute(query, queryParams);

    const gamesWithGenres = (rows as any[]).map(game => ({
      ...game,
      title: toTitleCase(game.title),
      description: capitalizeFirstLetterOfParagraphs(game.description),
      genres: game.genre_ids ? game.genre_ids.split(',').map((id: string) => parseInt(id)) : [],
      genreNames: game.genre_names ? game.genre_names.split(',').map((name: string) => toTitleCase(name)) : []
    }));

    connection.release();

    return NextResponse.json({ games: gamesWithGenres });
  } catch (error) {
    console.error('Error fetching games:', error);
    return NextResponse.json({ error: 'Failed to fetch games' }, { status: 500 });
  }
}
