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
      .then(data => setReviews(data));
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
    setReviews([newReview, ...reviews]);
    setReviewText('');
    setRating(5);
    setLoading(false);
  };

  return (
    <div className="mt-8 border-t pt-4">
      <h3 className="text-xl font-semibold mb-2">User Reviews</h3>

      {reviews.length === 0 && <p className="text-gray-500">No reviews yet.</p>}

      {reviews.map(r => (
        <div key={r._id} className="mb-4 p-2 bg-gray-100 rounded">
          <p className="font-bold">{r.userId} ⭐ {r.rating}</p>
          <p>{r.review}</p>
          <p className="text-xs text-gray-500">{new Date(r.createdAt).toLocaleString()}</p>
        </div>
      ))}

      <div className="mt-4">
        <h4 className="font-semibold">Leave a Review</h4>
        <textarea
          value={reviewText}
          onChange={e => setReviewText(e.target.value)}
          className="w-full border rounded p-2 mb-2"
          placeholder="Your thoughts..."
        />
        <div className="flex items-center gap-2">
          <label>Rating:</label>
          <input
            type="number"
            min={1}
            max={5}
            value={rating}
            onChange={e => setRating(Number(e.target.value))}
            className="w-16 border px-2 py-1"
          />
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700"
          >
            {loading ? 'Posting...' : 'Submit'}
          </button>
        </div>
      </div>
    </div>
  );
}
