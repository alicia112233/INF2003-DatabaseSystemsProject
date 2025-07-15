'use client';

import { useEffect, useState } from 'react';

interface Review {
  _id: string;
  userId: string;
  rating: number;
  review: string;
  createdAt: string;
}

export default function ReviewSection({ gameId }: { gameId: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`/api/reviews?gameId=${gameId}`)
      .then(res => res.json())
      .then(data => setReviews(Array.isArray(data) ? data : []));
  }, [gameId]);

  const handleSubmit = async () => {
    if (!reviewText.trim()) return;
    setLoading(true);

    const res = await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        gameId,
        userId: 'guest123', // Replace with session user ID later
        rating,
        review: reviewText
      })
    });

    const newReview = await res.json();
    // Ensure newReview has all required fields
    setReviews([
      {
        _id: newReview._id || Math.random().toString(36).slice(2),
        userId: newReview.userId || 'guest123',
        rating: newReview.rating || rating,
        review: newReview.review || reviewText,
        createdAt: newReview.createdAt || new Date().toISOString(),
      },
      ...reviews
    ]);
    setReviewText('');
    setRating(5);
    setLoading(false);
  };

  return (
    <div className="mt-8 border-t pt-4 max-w-2xl mx-auto">
      <h3 className="text-2xl font-bold mb-4 text-center">User Reviews</h3>

      {reviews.length === 0 && (
        <p className="text-gray-400 text-center mb-6">No reviews yet.</p>
      )}

      <div className="space-y-6">
        {reviews.map(r => (
          <div key={r._id} className="bg-white shadow-md rounded-xl p-5 flex flex-col gap-2 border border-gray-100 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg">
                {(r.userId && r.userId.length > 0) ? r.userId.charAt(0).toUpperCase() : '?'}
              </div>
              <div>
                <span className="font-semibold text-gray-800">{r.userId}</span>
                <span className="ml-2 text-yellow-500">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
              </div>
            </div>
            <p className="text-gray-700 italic">"{r.review}"</p>
            <p className="text-xs text-gray-400 text-right">{new Date(r.createdAt).toLocaleString()}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-gray-50 rounded-xl p-6 shadow-inner border border-gray-200">
        <h4 className="font-bold text-lg mb-2 text-gray-700">Leave a Review</h4>
        <textarea
          value={reviewText}
          onChange={e => setReviewText(e.target.value)}
          className="w-full border border-gray-300 rounded-lg p-3 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-200 resize-none min-h-[80px]"
          placeholder="Your thoughts..."
        />
        <div className="flex items-center gap-4 mb-3">
          <label className="font-medium text-gray-600">Rating:</label>
          <input
            type="number"
            min={1}
            max={5}
            value={rating}
            onChange={e => setRating(Number(e.target.value))}
            className="w-16 border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
        </div>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-60 w-full"
        >
          {loading ? 'Posting...' : 'Submit'}
        </button>
      </div>
    </div>
  );
}
