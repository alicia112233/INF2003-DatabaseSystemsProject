import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database';

function toTitleCase(str: string) {
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function capitalizeFirstLetterOfParagraphs(str: string) {
    if (!str) return str;
    
    // Split by common paragraph separators (newlines, double spaces, etc.)
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

        // to filter games, then get all genres for those games
        let query = `
            SELECT 
                g.*,
                GROUP_CONCAT(DISTINCT gg.genre_id) as genre_ids,
                GROUP_CONCAT(DISTINCT gen.name) as genre_names
            FROM Game g
            LEFT JOIN GameGenre gg ON g.id = gg.game_id
            LEFT JOIN Genre gen ON gg.genre_id = gen.id
        `;

        const queryParams: any[] = [];

        // Build the filtering conditions for the main query
        if (genreId || searchTerm || stockFilter) {
            // to filter games first, then get all their genres
            query = `
                SELECT 
                    g.*,
                    GROUP_CONCAT(DISTINCT gg.genre_id) as genre_ids,
                    GROUP_CONCAT(DISTINCT gen.name) as genre_names
                FROM Game g
                LEFT JOIN GameGenre gg ON g.id = gg.game_id
                LEFT JOIN Genre gen ON gg.genre_id = gen.id
                WHERE g.id IN (
                    SELECT DISTINCT g2.id
                    FROM Game g2
                    LEFT JOIN GameGenre gg2 ON g2.id = gg2.game_id
                    WHERE 1=1
            `;

            // Add genre filter in subquery
            if (genreId) {
                query += ' AND gg2.genre_id = ?';
                queryParams.push(parseInt(genreId));
            }

            // Add search filter in subquery
            if (searchTerm) {
                query += ' AND (g2.title LIKE ? OR g2.description LIKE ?)';
                queryParams.push(`%${searchTerm}%`, `%${searchTerm}%`);
            }

            // Add stock filter in subquery
            if (stockFilter === 'inStock') {
                query += ' AND g2.inStock = true';
            } else if (stockFilter === 'outOfStock') {
                query += ' AND g2.inStock = false';
            }

            query += ')';
        }

    query += ' GROUP BY g.id ORDER BY g.title ASC';

        const rows = await executeQuery(query, queryParams) as any[];

        const gamesWithGenres = rows.map(game => ({
            ...game,
            id: game.id.toString(),
            price: parseFloat(game.price),
            stockCount: game.stock_count,
            genres: game.genre_ids ? game.genre_ids.split(',').map((id: string) => parseInt(id)) : [],
            genreNames: game.genre_names ? game.genre_names.split(',').map((genre_name: string) => toTitleCase(genre_name)) : [],
            title: toTitleCase(game.title),
            description: capitalizeFirstLetterOfParagraphs(game.description),
            
            promotion: game.promo_id_alias && game.promo_isActive_alias ? {
                id: game.promo_id_alias,
                code: game.promo_code_alias,
                description: game.promo_description_alias,
                discountValue: parseFloat(game.promo_discountValue_alias),
                discountType: game.promo_discountType_alias,
                startDate: game.promo_startDate_alias,
                endDate: game.promo_endDate_alias,
                isActive: Boolean(game.promo_isActive_alias),
            } : null,
            promo_code: game.promo_code_alias || null,
        }));

        return NextResponse.json({ games: gamesWithGenres });
    } catch (error) {
        console.error('Error fetching games:', error);
        return NextResponse.json(
            { error: 'Failed to fetch games' },
            { status: 500 }
        );
    }
}