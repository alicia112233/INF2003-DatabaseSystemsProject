import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database';

// Helper function to capitalize first letter of each word
function toTitleCase(str: string): string {
    return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
}

// Helper function to capitalize first letter of each paragraph
function capitalizeFirstLetterOfParagraphs(text: string): string {
    return text.replace(/(?:^|\n\s*)([a-z])/g, (match, p1) => match.replace(p1, p1.toUpperCase()));
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        
        if (!id) {
            return NextResponse.json({ error: 'Game ID is required' }, { status: 400 });
        }

        const query = `
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
            WHERE g.id = ?
            GROUP BY g.id
        `;

        const result = await executeQuery(query, [id]);
        const games = result as any[];

        if (games.length === 0) {
            return NextResponse.json({ error: 'Game not found' }, { status: 404 });
        }

        const game = games[0];

        // Format the game data
        const formattedGame = {
            id: game.id.toString(),
            title: toTitleCase(game.title),
            description: capitalizeFirstLetterOfParagraphs(game.description || ''),
            price: parseFloat(game.price) || 0,
            image_url: game.image_url,
            stockCount: game.stock_count || 0,
            genreNames: game.genre_names 
                ? game.genre_names.split(',').map((genre: string) => toTitleCase(genre.trim()))
                : [],
            promotion: game.promo_isActive_alias ? {
                id: game.promo_id_alias,
                code: game.promo_code_alias,
                description: game.promo_description_alias,
                discountValue: parseFloat(game.promo_discountValue_alias) || 0,
                discountType: game.promo_discountType_alias,
                startDate: game.promo_startDate_alias,
                endDate: game.promo_endDate_alias,
                isActive: Boolean(game.promo_isActive_alias)
            } : null,
            inStock: game.stock_count > 0,
            promo_code: game.promo_code_alias ? toTitleCase(game.promo_code_alias) : null
        };

        return NextResponse.json(formattedGame);
    } catch (error) {
        console.error('Error fetching game:', error);
        return NextResponse.json(
            { error: 'Failed to fetch game' },
            { status: 500 }
        );
    }
}
