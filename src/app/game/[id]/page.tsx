import ScreenshotCarousel from '@/components/reviewsection/ScreenshotCarousel';
import ReviewSection from '@/components/reviewsection/ReviewSection';
import { getReviewStats } from '@/utils/reviewStats';
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

// Function to fetch reviews for rating statistics
async function getGameReviews(gameId: number) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/reviews?gameId=${gameId}`, {
      cache: 'no-store' // Ensure fresh data
    });
    
    if (!response.ok) {
      return [];
    }
    
    const reviews = await response.json();
    return Array.isArray(reviews) ? reviews : [];
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return [];
  }
}


interface Props {
  params: { id: string };
}

export default async function GamePage({ params }: { params: { id: string } }) {
  const { id } = await params;
  const game = await getGameDetails(id);
  const screenshots = await getScreenshots(Number(id));
  const reviews = await getGameReviews(Number(id));
  const reviewStats = getReviewStats(reviews);

  if (!game) {
    return <div className="p-6 text-red-600">Game not found.</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-50 to-indigo-100 flex flex-col items-center py-0 relative overflow-x-hidden">
      {/* Animated background pattern */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="w-full h-full bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-purple-200/50 via-blue-200/30 to-transparent opacity-70 animate-pulse"></div>
        <div className="absolute top-20 left-10 w-32 h-32 bg-purple-300/20 rounded-full blur-xl animate-bounce"></div>
        <div className="absolute bottom-40 right-20 w-48 h-48 bg-blue-300/20 rounded-full blur-xl animate-pulse"></div>
      </div>
      
      {/* Hero Banner Section */}
      {game.image_url && (
        <div className="relative w-full h-[350px] sm:h-[500px] flex items-center justify-center overflow-hidden z-10 shadow-2xl">
          <img
            src={game.image_url}
            alt={game.title}
            className="w-full h-full object-cover object-center transition-transform duration-1000 hover:scale-110 filter brightness-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-purple-900/30 to-transparent" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center px-8 max-w-5xl">
              <h1 className="text-6xl sm:text-8xl font-black text-white drop-shadow-2xl mb-6 tracking-tight leading-tight animate-fade-in-up bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent filter drop-shadow-lg">
                {game.title}
              </h1>
              <div className="flex items-center justify-center gap-6 flex-wrap mt-8">
                <span className="bg-gradient-to-r from-emerald-500 to-green-600 backdrop-blur-md text-white px-8 py-4 rounded-full font-black text-2xl shadow-2xl border-2 border-emerald-300/50 transform hover:scale-110 transition-all duration-300 animate-pulse">
                  💰 ${Number(game.price).toFixed(2)}
                </span>
                <span className="bg-gradient-to-r from-white to-gray-100 backdrop-blur-md text-gray-800 px-6 py-4 rounded-full font-bold text-xl shadow-2xl border-2 border-white/70 transform hover:scale-110 transition-all duration-300">
                  📅 {new Date(game.release_date).toLocaleDateString()}
                </span>
                {reviewStats && (
                  <span className="bg-gradient-to-r from-yellow-400 to-orange-500 backdrop-blur-md text-white px-6 py-4 rounded-full font-bold text-xl shadow-2xl border-2 border-yellow-300/70 transform hover:scale-110 transition-all duration-300">
                    ⭐ {reviewStats.averageRating} ({reviewStats.totalReviews} {reviewStats.totalReviews === 1 ? 'review' : 'reviews'})
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Main Content Container */}
      <div className="w-full max-w-7xl bg-gradient-to-br from-white via-purple-50/50 to-blue-50/50 backdrop-blur-lg rounded-t-[3rem] shadow-2xl border-t-4 border-gradient-to-r border-purple-300 -mt-20 mb-12 z-10 relative transform hover:shadow-3xl transition-all duration-500">
        <div className="px-10 py-16 sm:px-16 sm:py-20 space-y-16">
          
          {/* Back Button */}
          <div className="flex justify-start">
            <a href="/products" className="group inline-flex items-center bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 hover:from-purple-700 hover:via-blue-700 hover:to-indigo-700 text-white font-bold px-8 py-4 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-110 hover:shadow-purple-500/50 border-2 border-white/20">
              <span className="text-xl mr-3 transition-transform group-hover:-translate-x-2">🔙</span> 
              <span className="text-lg">Back to Games</span>
            </a>
          </div>

          {/* Description Section */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 relative overflow-hidden transform hover:shadow-xl transition-all duration-300">
            {/* Subtle background decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-50 to-purple-50 rounded-full transform translate-x-16 -translate-y-16 opacity-60"></div>
            
            {/* Modern Header */}
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
                <span className="w-1 h-6 bg-blue-500 rounded-full mr-4"></span>
                About This Game
              </h2>
              <div className="w-16 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
            </div>

            {/* Clean Description Text */}
            <div className="relative">
              <p className="text-gray-700 leading-relaxed text-lg font-normal max-w-4xl">
                {game.description}
              </p>
            </div>
          </div>

          {/* Screenshot Gallery */}
          {screenshots.length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 relative overflow-hidden transform hover:shadow-xl transition-all duration-300">
              {/* Subtle background decoration */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-50 to-pink-50 rounded-full transform translate-x-16 -translate-y-16 opacity-60"></div>
              
              {/* Modern Header */}
              <div className="mb-6">
                <h2 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
                  <span className="w-1 h-6 bg-purple-500 rounded-full mr-4"></span>
                  Screenshots
                </h2>
                <div className="w-16 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
              </div>

              {/* Clean Screenshots Content */}
              <div className="relative bg-gray-50 rounded-xl p-4 border border-gray-100">
                <ScreenshotCarousel urls={screenshots} />
              </div>
            </div>
          )}

          {/* Reviews Section */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 relative overflow-hidden transform hover:shadow-xl transition-all duration-300">
            {/* Subtle background decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full transform translate-x-16 -translate-y-16 opacity-60"></div>
            
            {/* Modern Header */}
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
                <span className="w-1 h-6 bg-blue-500 rounded-full mr-4"></span>
                Reviews & Ratings
              </h2>
              <div className="w-16 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"></div>
            </div>

            {/* Clean Reviews Content */}
            <div className="relative bg-gray-50 rounded-xl p-6 border border-gray-100">
              <ReviewSection gameId={id} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
