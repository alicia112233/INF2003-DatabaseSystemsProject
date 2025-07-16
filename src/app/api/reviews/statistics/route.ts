import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/utils/mongodb';
import { pool } from '@/app/lib/db';

// Define the Review schema
const ReviewSchema = new mongoose.Schema({
    gameId: { type: Number, required: true }, 
    userId: { type: Number, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    review: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date }
}, {
    collection: 'reviews'
});

let Review: mongoose.Model<any>;
try {
  Review = mongoose.model('Review');
} catch {
  Review = mongoose.model('Review', ReviewSchema);
}

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    
    // Get all games from MySQL
    const connection = await pool.getConnection();
    const [games] = await connection.query(`
      SELECT id, title, image_url, price 
      FROM Game 
      ORDER BY title ASC
    `);
    connection.release();

    // Get review statistics from MongoDB using aggregation
    const reviewStats = await Review.aggregate([
      {
        $group: {
          _id: "$gameId",
          totalReviews: { $sum: 1 },
          averageRating: { $avg: "$rating" },
          ratings: { $push: "$rating" },
          latestReview: { $max: "$createdAt" },
          oldestReview: { $min: "$createdAt" }
        }
      },
      {
        $addFields: {
          // Calculate rating distribution
          fiveStars: {
            $size: {
              $filter: {
                input: "$ratings",
                cond: { $eq: ["$$this", 5] }
              }
            }
          },
          fourStars: {
            $size: {
              $filter: {
                input: "$ratings",
                cond: { $eq: ["$$this", 4] }
              }
            }
          },
          threeStars: {
            $size: {
              $filter: {
                input: "$ratings",
                cond: { $eq: ["$$this", 3] }
              }
            }
          },
          twoStars: {
            $size: {
              $filter: {
                input: "$ratings",
                cond: { $eq: ["$$this", 2] }
              }
            }
          },
          oneStar: {
            $size: {
              $filter: {
                input: "$ratings",
                cond: { $eq: ["$$this", 1] }
              }
            }
          }
        }
      },
      {
        $project: {
          gameId: "$_id",
          totalReviews: 1,
          averageRating: { $round: ["$averageRating", 2] },
          latestReview: 1,
          oldestReview: 1,
          ratingDistribution: {
            five: "$fiveStars",
            four: "$fourStars",
            three: "$threeStars",
            two: "$twoStars",
            one: "$oneStar"
          }
        }
      },
      {
        $sort: { totalReviews: -1 }
      }
    ]);

    // Merge game data with review statistics
    const gameReviewStats = (games as any[]).map(game => {
      const stats = reviewStats.find(stat => stat.gameId === game.id);
      return {
        ...game,
        reviewStats: stats ? {
          totalReviews: stats.totalReviews,
          averageRating: stats.averageRating,
          latestReview: stats.latestReview,
          oldestReview: stats.oldestReview,
          ratingDistribution: stats.ratingDistribution
        } : {
          totalReviews: 0,
          averageRating: 0,
          latestReview: null,
          oldestReview: null,
          ratingDistribution: { five: 0, four: 0, three: 0, two: 0, one: 0 }
        }
      };
    });

    // Calculate overall statistics
    const overallStats = await Review.aggregate([
      {
        $group: {
          _id: null,
          totalReviews: { $sum: 1 },
          averageRating: { $avg: "$rating" },
          totalGamesWithReviews: { $addToSet: "$gameId" },
          recentReviews: {
            $sum: {
              $cond: [
                { $gte: ["$createdAt", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)] },
                1,
                0
              ]
            }
          }
        }
      },
      {
        $addFields: {
          totalGamesWithReviews: { $size: "$totalGamesWithReviews" }
        }
      }
    ]);

    return NextResponse.json({
      games: gameReviewStats,
      overallStats: overallStats[0] || {
        totalReviews: 0,
        averageRating: 0,
        totalGamesWithReviews: 0,
        recentReviews: 0
      }
    });

  } catch (error) {
    console.error('Error fetching review statistics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch review statistics' },
      { status: 500 }
    );
  }
}
