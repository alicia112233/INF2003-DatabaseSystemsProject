import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/app/lib/db';

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
    let connection;
    try {
        const { searchParams } = new URL(request.url);
        const genreId = searchParams.get('genre');
        const searchTerm = searchParams.get('search');
        const stockFilter = searchParams.get('stock');

        connection = await pool.getConnection();

        let query = `
            SELECT 
                g.*,
                GROUP_CONCAT(DISTINCT gg.genre_id) as genre_ids,
                GROUP_CONCAT(DISTINCT gen.name) as genre_names,
                p.id as promo_id_alias,
                p.code as promo_code_alias,
                p.description as promo_description_alias,
                p.discountValue as promo_discountValue_alias,
                p.discountType as promo_discountType_alias,
                p.startDate as promo_startDate_alias,
                p.endDate as promo_endDate_alias,
                p.isActive as promo_isActive_alias
            FROM Game g
            LEFT JOIN GameGenre gg ON g.id = gg.game_id
            LEFT JOIN Genre gen ON gg.genre_id = gen.id
            LEFT JOIN Promotion p ON g.promo_id = p.id
        `;

        const queryParams: any[] = [];
        const subqueryWhereClauses: string[] = ['1=1'];

        if (genreId) {
            subqueryWhereClauses.push('gg2.genre_id = ?');
            queryParams.push(parseInt(genreId));
        }

        if (searchTerm) {
            subqueryWhereClauses.push('(g2.title LIKE ? OR g2.description LIKE ?)');
            queryParams.push(`%${searchTerm}%`, `%${searchTerm}%`);
        }

        if (stockFilter === 'inStock') {
            subqueryWhereClauses.push('g2.stock_count > 0');
        } else if (stockFilter === 'outOfStock') {
            subqueryWhereClauses.push('g2.stock_count <= 0');
        } else if (stockFilter === 'onSale') {
            subqueryWhereClauses.push('g2.promo_id IS NOT NULL');
        }

        if (genreId || searchTerm || stockFilter) {
            query += `
                WHERE g.id IN (
                    SELECT DISTINCT g2.id
                    FROM Game g2
                    LEFT JOIN GameGenre gg2 ON g2.id = gg2.game_id
                    WHERE ${subqueryWhereClauses.join(' AND ')}
                )
            `;
        }

        query += ' GROUP BY g.id ORDER BY g.title ASC';

        const [rows] = await connection.execute(query, queryParams);

        const gamesWithGenres = (rows as any[]).map(game => ({
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
    } catch (error: any) {
        console.error('Error fetching games:', error);
        return NextResponse.json(
            { error: 'Failed to fetch games', details: error.message },
            { status: 500 }
        );
    } finally {
        if (connection) {
            connection.release();
        }
    }
}