import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database';

function toTitleCase(str: string) {
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function capitalizeFirstLetterOfParagraphs(str: string | null) {
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
    const stockFilter = searchParams.get('stock');

    const whereClauses: string[] = [`genre.name = 'adventure'`];

    if (stockFilter === 'inStock') {
      whereClauses.push('g.stock_count > 0');
    } else if (stockFilter === 'outOfStock') {
      whereClauses.push('g.stock_count <= 0');
    } else if (stockFilter === 'onSale') {
      whereClauses.push('g.promo_id IS NOT NULL');
    }
    // Query for games with adventure genre
    const rows = await executeQuery(`
      SELECT 
        g.id,
        g.title,
        g.description,
        g.price,
        g.image_url,
        g.stock_count,
        g.promo_id,
        p.code as promo_code,
        p.discountValue,
        p.discountType,
        p.startDate,
        p.endDate,
        p.isActive,
        GROUP_CONCAT(DISTINCT genre.name) as genreNames
      FROM Game g
      LEFT JOIN Promotion p ON g.promo_id = p.id
      LEFT JOIN GameGenre gg ON g.id = gg.game_id
      LEFT JOIN Genre genre ON gg.genre_id = genre.id
      WHERE ${whereClauses.join(' AND ')}
      GROUP BY 
        g.id, g.title, g.description, g.price, g.image_url, g.stock_count,
        g.promo_id, p.code, p.discountValue, p.discountType, p.startDate, p.endDate, p.isActive
      ORDER BY RAND()
    `);

    const formattedGames = (rows as any[]).map(game => ({
      id: game.id,
      title: toTitleCase(game.title),
      description: capitalizeFirstLetterOfParagraphs(game.description),
      price: Number(game.price) || 0,
      image_url: game.image_url,
      stockCount: game.stock_count,
      genreNames: game.genreNames
        ? game.genreNames.split(',').map((g: string) => toTitleCase(g.trim()))
        : [],
      promotion:
        game.promo_code && game.isActive
          ? {
              code: toTitleCase(game.promo_code),
              discountValue: parseFloat(game.discountValue),
              discountType: game.discountType,
              startDate: game.startDate,
              endDate: game.endDate,
              isActive: Boolean(game.isActive),
            }
          : null,
    }));

    return NextResponse.json({ games: formattedGames });
  } catch (error: any) {
    console.error('Error fetching adventure games:', error);
    return NextResponse.json(
      { error: 'Failed to fetch adventure games', details: error.message },
      { status: 500 }
    );
  }
}
