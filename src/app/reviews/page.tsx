"use client"
import { useEffect, useState } from "react";

export default function ReviewSection({ gameId }: { gameId: string }) {
  const [reviews, setReviews] = useState([]);
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(5);

  useEffect(() => {
    fetch(`/api/reviews?gameId=${gameId}`)
      .then(res => res.json())
      .then(setReviews);
  }, [gameId]);

  const submitReview = async () => {
    await fetch("/api/reviews", {
      method: "POST",
      body: JSON.stringify({
        gameId,
        userId: "demo-user",  // Replace with auth session
        rating,
        comment
      })
    });
    setComment("");
    setRating(5);
  };

  return (
    <div>
      <h3>Reviews</h3>
      {reviews.map((r, i) => (
        <div key={i}>
          <strong>{r.rating}⭐</strong> — {r.comment}
        </div>
      ))}

      <textarea value={comment} onChange={e => setComment(e.target.value)} />
      <input
        type="number"
        min="1"
        max="5"
        value={rating}
        onChange={e => setRating(parseInt(e.target.value))}
      />
      <button onClick={submitReview}>Submit Review</button>
    </div>
  );
}
