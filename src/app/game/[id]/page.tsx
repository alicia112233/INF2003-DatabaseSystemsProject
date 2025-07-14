import ScreenshotCarousel from '@/components/ReviewSection/ScreenshotCarousel';
import ReviewSection from '@/components/ReviewSection/ReviewSection';
import mysql from 'mysql2/promise';

interface Game {
  id: number;
  title: string;
  description: string;
  price: number | string;
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

  const [rows] = await db.execute('SELECT * FROM game WHERE id = ?', [Number(gameId)]);
  await db.end();

  if (Array.isArray(rows) && rows.length > 0) {
    return rows[0] as Game;
  }
  return null;
}

// New function to fetch screenshot URLs
async function getScreenshots(gameId: number): Promise<string[]> {
  const db = await mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    port: Number(process.env.MYSQL_PORT),
    database: process.env.MYSQL_DATABASE,
  });
  const [rows] = await db.execute('SELECT url FROM Screenshot WHERE game_id = ?', [gameId]);
  await db.end();
  return (rows as any[]).map(row => row.url);
}


interface Props {
  params: { id: string };
}

export default async function GamePage({ params }: { params: { id: string } }) {
  const id = params.id;
  const game = await getGameDetails(id);
  const screenshots = await getScreenshots(Number(id));

  if (!game) {
    return <div className="p-6 text-red-600">Game not found.</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 flex flex-col items-center py-0 relative overflow-x-hidden">
      {/* Decorative background pattern */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="w-full h-full bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-blue-100/60 via-transparent to-transparent opacity-60"></div>
      </div>
      {/* Banner Image Full Viewport Width */}
      {game.image_url && (
        <div className="relative w-full h-[220px] sm:h-[320px] flex items-center justify-center overflow-hidden shadow-lg z-10">
          <img
            src={game.image_url}
            alt={game.title}
            className="w-full h-full object-cover object-center scale-105 transition-transform duration-500 hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
          <div className="absolute inset-0 flex items-center justify-center">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white drop-shadow-2xl text-center px-4 tracking-tight animate-fade-in-up">
              {game.title}
            </h1>
          </div>
        </div>
      )}
      {/* Card Content */}
      <div className="w-full max-w-2xl bg-white/90 rounded-3xl shadow-2xl border border-blue-200 overflow-hidden -mt-12 mb-16 z-10 backdrop-blur-md">
        <div className="p-6 sm:p-10 space-y-10">
          {/* Back Button */}
          <div className="flex justify-center mb-2">
            <a href="/products" className="inline-flex items-center bg-blue-50 text-blue-700 hover:bg-blue-200 font-semibold px-4 py-2 rounded-full shadow transition text-base gap-2">
              <span className="text-lg">←</span> Back to Games
            </a>
          </div>

          {/* Game Info */}
          <div className="flex flex-wrap items-center gap-4 justify-center mb-4">
            <span className="bg-blue-100 text-blue-800 px-5 py-2 rounded-full font-bold text-xl shadow border border-blue-200">
              ${Number(game.price).toFixed(2)}
            </span>
            <span className="bg-gray-100 text-gray-700 px-4 py-1 rounded-full text-base border border-gray-200">
              Released: <span className="font-medium">{new Date(game.release_date).toLocaleDateString()}</span>
            </span>
          </div>

          <hr className="border-blue-100" />

          {/* Description Card */}
          <div className="bg-gray-50 border border-blue-100 rounded-xl shadow p-6 mb-6">
            <h2 className="text-2xl font-bold mb-3 text-gray-800 text-center tracking-tight">Description</h2>
            <p className="text-gray-700 leading-relaxed text-lg text-center max-w-xl mx-auto">{game.description}</p>
          </div>

          {/* Screenshot Carousel Card */}
          {screenshots.length > 0 && (
            <div className="bg-gray-50 border border-blue-100 rounded-xl shadow p-6 mb-6">
              <h2 className="text-2xl font-bold mb-3 text-gray-800 text-center tracking-tight">Screenshots</h2>
              <div className="rounded-xl overflow-hidden border-2 border-blue-100 bg-gray-50 p-3 shadow-md transition-shadow duration-300 hover:shadow-xl">
                <ScreenshotCarousel urls={screenshots} />
              </div>
            </div>
          )}

          {/* Reviews Card */}
          <div className="bg-gray-50 border border-blue-100 rounded-xl shadow p-6 mb-6">
            <ReviewSection gameId={id} />
          </div>
        </div>
      </div>
    </div>
  );
}
