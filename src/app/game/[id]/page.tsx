import ReviewSection from '@/components/ReviewSection/ReviewSection';
import mysql from 'mysql2/promise';

interface Game {
  id: number;
  title: string;
  description: string;
  price: number;
  release_date: string;
  image_url?: string;
}

async function getGameDetails(gameId: string): Promise<Game | null> {
  const db = await mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    port: Number(process.env.MYSQL_PORT),
    database: process.env.MYSQL_DATABASE,
  });

  const [rows] = await db.execute('SELECT * FROM game WHERE id = ?', [gameId]);
  await db.end();

  if (Array.isArray(rows) && rows.length > 0) {
    return rows[0] as Game;
  }

  return null;
}

export default async function GamePage({ params }: { params: { id: string } }) {
  const gameId = params.id;
  const game = await getGameDetails(gameId);

  if (!game) {
    return <div className="p-6 text-red-600">Game not found.</div>;
  }

  return (
  <div className="p-6 max-w-3xl mx-auto">
    <h1 className="text-3xl font-bold mb-2">{game.title}</h1>
    <p className="text-gray-500 mb-1">
      Released: {new Date(game.release_date).toLocaleDateString()}
    </p>
    <p className="text-lg font-semibold mb-4 text-blue-600">
      ${Number(game.price).toFixed(2)}
    </p>
    <p className="mb-6">{game.description}</p>

    <ReviewSection gameId={gameId} />
  </div>
);

}
