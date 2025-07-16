'use client';

import { useEffect, useState } from 'react';

interface Review {
  _id: string;
  userId: number; // Changed from string to number
  rating: number;
  review: string;
  createdAt: string;
}

export default function ReviewSection({ gameId }: { gameId: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState('');
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [hasUserReviewed, setHasUserReviewed] = useState(false);

  // Check if user is logged in
  useEffect(() => {
    const checkAuth = () => {
      const loggedIn = document.cookie.includes('isLoggedIn=true');
      const role = document.cookie.split('; ').find(row => row.startsWith('userRole='))?.split('=')[1] || '';
      const userId = document.cookie.split('; ').find(row => row.startsWith('userId='))?.split('=')[1];
      
      setIsLoggedIn(loggedIn);
      setUserRole(role);
      setCurrentUserId(userId ? parseInt(userId) : null);
    };
    
    checkAuth();
  }, []);

  // Check if current user has already reviewed this game
  useEffect(() => {
    if (currentUserId && reviews.length > 0) {
      const userReview = reviews.find(review => review.userId === currentUserId);
      setHasUserReviewed(!!userReview);
    }
  }, [currentUserId, reviews]);

  useEffect(() => {
    console.log('Fetching reviews for gameId:', gameId);
    fetch(`/api/reviews?gameId=${gameId}`)
      .then(res => {
        console.log('Reviews API response status:', res.status);
        return res.json();
      })
      .then(data => {
        console.log('Reviews API response data:', data);
        setReviews(Array.isArray(data) ? data : []);
      })
      .catch(err => {
        console.error('Error fetching reviews:', err);
        setReviews([]);
      });
  }, [gameId]);

  const handleSubmit = async () => {
    if (!reviewText.trim()) return;
    setLoading(true);

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameId: parseInt(gameId), // Convert string to number
          // Remove userId - it will be taken from authentication cookies
          rating,
          review: reviewText
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error('Failed to post review:', errorData);
        
        if (res.status === 401) {
          // Authentication error
          alert('You must be logged in to submit a review. Please log in and try again.');
          // Redirect to login page
          window.location.href = '/authentication/login';
          return;
        } else if (res.status === 409) {
          // Duplicate review error
          alert('You have already reviewed this game. Each user can only submit one review per game.');
          // Refresh the page to update the UI
          window.location.reload();
          return;
        } else {
          alert('Failed to post review: ' + (errorData.error || 'Unknown error'));
        }
        setLoading(false);
        return;
      }

      const newReview = await res.json();
      console.log('Review posted successfully:', newReview);
      
      // Add the new review to the list
      setReviews([newReview, ...reviews]);
      setReviewText('');
      setRating(5);
      
      // Refresh the reviews from the server to ensure consistency
      setTimeout(() => {
        fetch(`/api/reviews?gameId=${gameId}`)
          .then(res => res.json())
          .then(data => {
            console.log('Refreshed reviews:', data);
            setReviews(Array.isArray(data) ? data : []);
          })
          .catch(err => console.error('Error refreshing reviews:', err));
      }, 500);
      
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-8 border-t pt-4 max-w-2xl mx-auto">
      <h3 className="text-2xl font-bold mb-4 text-center">User Reviews</h3>

      {reviews.length === 0 && (
        <p className="text-gray-400 text-center mb-6">No reviews yet.</p>
      )}

      <div className="space-y-6">
        {reviews.map(r => {
          const isCurrentUserReview = currentUserId === r.userId;
          return (
            <div key={r._id} className={`bg-white shadow-md rounded-xl p-5 flex flex-col gap-2 border transition-shadow ${
              isCurrentUserReview ? 'border-blue-200 bg-blue-50 shadow-lg' : 'border-gray-100 hover:shadow-lg'
            }`}>
              <div className="flex items-center gap-3 mb-1">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                  isCurrentUserReview ? 'bg-blue-200 text-blue-700' : 'bg-gray-100 text-gray-600'
                }`}>
                  {r.userId ? r.userId.toString().charAt(0) : '?'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-800">User {r.userId}</span>
                    {isCurrentUserReview && (
                      <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">Your Review</span>
                    )}
                  </div>
                  <span className="text-yellow-500">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                </div>
              </div>
              <p className="text-gray-700 italic">"{r.review}"</p>
              <p className="text-xs text-gray-400 text-right">{new Date(r.createdAt).toLocaleString()}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-8 bg-gray-50 rounded-xl p-6 shadow-inner border border-gray-200">
        {isLoggedIn ? (
          hasUserReviewed ? (
            <div className="text-center py-8">
              <h4 className="font-bold text-lg mb-3 text-gray-700">Thank You!</h4>
              <p className="text-gray-600">You have already reviewed this game. Each user can only submit one review per game.</p>
              <p className="text-sm text-gray-500 mt-2">You can see your review above.</p>
            </div>
          ) : (
            <>
              <h4 className="font-bold text-lg mb-2 text-gray-700">
                Leave a Review {userRole === 'admin' && <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded ml-2">ADMIN</span>}
              </h4>
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
                {loading ? 'Posting...' : 'Submit Review'}
              </button>
            </>
          )
        ) : (
          <div className="text-center py-8">
            <h4 className="font-bold text-lg mb-3 text-gray-700">Want to Leave a Review?</h4>
            <p className="text-gray-600 mb-4">You need to be logged in to submit a review.</p>
            <div className="flex gap-3 justify-center">
              <a 
                href="/authentication/login" 
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Login
              </a>
              <a 
                href="/authentication/register" 
                className="bg-gray-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
              >
                Sign Up
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
