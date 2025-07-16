'use client';

import { useEffect, useState } from 'react';
import { getReviewStats } from '@/utils/reviewStats';

interface Review {
  _id: string;
  userId: number; // Changed from string to number
  rating: number;
  review: string;
  createdAt: string;
  updatedAt?: string;
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
  
  // Admin edit state
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [editRating, setEditRating] = useState(5);
  const [editReviewText, setEditReviewText] = useState('');
  const [editLoading, setEditLoading] = useState(false);

  // Generate unique ID for this component instance
  const componentId = 'reviews-component';

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

  // Admin function to start editing a review
  const startEditReview = (review: Review) => {
    setEditingReviewId(review._id);
    setEditRating(review.rating);
    setEditReviewText(review.review);
  };

  // Admin function to cancel editing
  const cancelEdit = () => {
    setEditingReviewId(null);
    setEditRating(5);
    setEditReviewText('');
  };

  // Admin function to save edited review
  const saveEditedReview = async () => {
    if (!editReviewText.trim()) return;
    setEditLoading(true);

    try {
      const res = await fetch('/api/reviews', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reviewId: editingReviewId,
          rating: editRating,
          review: editReviewText
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error('Failed to update review:', errorData);
        alert('Failed to update review: ' + (errorData.error || 'Unknown error'));
        return;
      }

      const updatedReview = await res.json();
      console.log('Review updated successfully:', updatedReview);
      
      // Update the reviews list with the edited review
      setReviews(reviews.map(r => r._id === editingReviewId ? updatedReview : r));
      
      // Clear edit state
      cancelEdit();
      
    } catch (error) {
      console.error('Error updating review:', error);
      alert('Failed to update review. Please try again.');
    } finally {
      setEditLoading(false);
    }
  };

  // Admin function to delete a review
  const deleteReview = async (reviewId: string) => {
    if (!confirm('Are you sure you want to delete this review? This action cannot be undone.')) {
      return;
    }

    try {
      const res = await fetch(`/api/reviews?reviewId=${reviewId}`, {
        method: 'DELETE'
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error('Failed to delete review:', errorData);
        alert('Failed to delete review: ' + (errorData.error || 'Unknown error'));
        return;
      }

      const result = await res.json();
      console.log('Review deleted successfully:', result);
      
      // Remove the deleted review from the list
      setReviews(reviews.filter(r => r._id !== reviewId));
      
    } catch (error) {
      console.error('Error deleting review:', error);
      alert('Failed to delete review. Please try again.');
    }
  };

  return (
    <div style={{ isolation: 'isolate' }}>
      <style dangerouslySetInnerHTML={{
        __html: `
          .${componentId} {
            counter-reset: none !important;
          }
          
          .${componentId} *::before {
            content: none !important;
            display: none !important;
          }
          
          .${componentId} *::after {
            content: none !important;
            display: none !important;
          }
          
          .${componentId} * {
            list-style: none !important;
            counter-increment: none !important;
          }
          
          .${componentId} ol, .${componentId} ul {
            list-style: none !important;
            counter-reset: none !important;
          }
          
          .${componentId} li::before {
            content: none !important;
            display: none !important;
          }
          
          .${componentId} .space-y-6 > * {
            counter-increment: none !important;
          }
          
          .${componentId} .space-y-6 > *::before {
            content: none !important;
            display: none !important;
          }
        `
      }} />
      <div className={`${componentId} mt-8 border-t pt-4 max-w-2xl mx-auto`}>
        <h3 className="text-2xl font-bold mb-6 text-center">User Reviews</h3>

        {reviews.length === 0 && (
          <p className="text-gray-400 text-center mb-6">No reviews yet.</p>
        )}

        <div className="space-y-8" style={{ counterReset: 'none', listStyle: 'none' }}>
          {reviews.map((r, index) => {
            const isCurrentUserReview = currentUserId === r.userId;
            const isEditing = editingReviewId === r._id;
            
            return (
              <div key={r._id}>
                <div 
                  className={`bg-white shadow-md rounded-xl p-6 border transition-all duration-200 hover:shadow-lg ${
                    isCurrentUserReview ? 'border-blue-200 bg-blue-50 shadow-lg ring-1 ring-blue-200' : 'border-gray-200 hover:border-gray-300'
                  }`}
                  style={{ counterIncrement: 'none', listStyle: 'none' }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shadow-sm ${
                        isCurrentUserReview ? 'bg-blue-200 text-blue-700' : 'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-700'
                      }`}>
                        {r.userId ? r.userId.toString().charAt(0) : '?'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-gray-800">User {r.userId}</span>
                          {isCurrentUserReview && (
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">Your Review</span>
                          )}
                          {r.updatedAt && (
                            <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full font-medium">Edited</span>
                          )}
                        </div>
                        {!isEditing && (
                          <div className="flex items-center gap-2">
                            <span className="text-yellow-500 text-lg">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                            <span className="text-sm text-gray-500">({r.rating}/5)</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Admin Controls */}
                    {userRole === 'admin' && !isEditing && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => startEditReview(r)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium px-2 py-1 rounded hover:bg-blue-50 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteReview(r._id)}
                          className="text-red-600 hover:text-red-800 text-sm font-medium px-2 py-1 rounded hover:bg-red-50 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                
                {isEditing ? (
                  // Edit mode
                  <div className="space-y-3">
                    <div className="flex items-center gap-4">
                      <label className="font-medium text-gray-600">Rating:</label>
                      <input
                        type="number"
                        min={1}
                        max={5}
                        value={editRating}
                        onChange={e => setEditRating(Number(e.target.value))}
                        className="w-16 border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-200"
                      />
                    </div>
                    <textarea
                      value={editReviewText}
                      onChange={e => setEditReviewText(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-200 resize-none min-h-[80px]"
                      placeholder="Edit review..."
                    />
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={cancelEdit}
                        className="bg-gray-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-600 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={saveEditedReview}
                        disabled={editLoading}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-60"
                      >
                        {editLoading ? 'Saving...' : 'Save'}
                      </button>
                    </div>
                  </div>
                ) : (
                  // Display mode
                  <div className="mt-4">
                    <blockquote className="text-gray-700 text-base leading-relaxed border-l-4 border-blue-200 pl-4 bg-gray-50 rounded-r-lg p-3 mb-4">
                      "{r.review}"
                    </blockquote>
                    <div className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-2 text-gray-500">
                        <span>{new Date(r.createdAt).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}</span>
                      </div>
                      {r.updatedAt && (
                        <div className="flex items-center gap-1 text-orange-600">
                          <span>Updated: {new Date(r.updatedAt).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Separator between reviews - don't show after the last review */}
              {index < reviews.length - 1 && (
                <div className="flex items-center justify-center py-4">
                  <div className="w-full max-w-xs h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                </div>
              )}
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
              <div className="space-y-4">
                <h4 className="font-bold text-lg mb-4 text-gray-700 text-center">
                  Share Your Experience {userRole === 'admin' && <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded ml-2">ADMIN</span>}
                </h4>
                
                {/* Rating Input with Visual Stars */}
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <label className="block font-medium text-gray-700 mb-2">Your Rating</label>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className={`text-2xl transition-colors ${
                            star <= rating ? 'text-yellow-400 hover:text-yellow-500' : 'text-gray-300 hover:text-yellow-300'
                          }`}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">({rating}/5)</span>
                  </div>
                </div>

                {/* Review Text */}
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <label className="block font-medium text-gray-700 mb-2">Your Review</label>
                  <textarea
                    value={reviewText}
                    onChange={e => setReviewText(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 resize-none min-h-[100px] transition-all"
                    placeholder="Share your thoughts about this game... What did you like? What could be improved?"
                  />
                  <div className="mt-2 text-sm text-gray-500">
                    {reviewText.length}/500 characters
                  </div>
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={loading || !reviewText.trim()}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-md hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"></circle>
                        <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" className="opacity-75"></path>
                      </svg>
                      Posting Review...
                    </div>
                  ) : (
                    'Submit Review'
                  )}
                </button>
              </div>
            )
          ) : (
            <div className="text-center py-8">
              <h4 className="font-bold text-lg mb-3 text-gray-700">Want to Leave a Review?</h4>
              <p className="text-gray-600 mb-4">You need to be logged in to submit a review.</p>
              <div className="flex gap-3 justify-center">
                <button 
                  onClick={() => window.location.href = '/authentication/login'}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  Log In
                </button>
                <button 
                  onClick={() => window.location.href = '/authentication/register'}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors shadow-md hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  Sign Up
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
