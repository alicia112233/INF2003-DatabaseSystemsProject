interface Review {
  _id: string;
  userId: number;
  rating: number;
  review: string;
  createdAt: string;
  updatedAt?: string;
}

export const getReviewStats = (reviews: Review[]) => {
  if (!reviews || reviews.length === 0) {
    return null;
  }
  
  const totalReviews = reviews.length;
  const averageRating = reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews;
  const roundedRating = Math.round(averageRating);
  
  return {
    totalReviews,
    averageRating: Number(averageRating.toFixed(1)),
    roundedRating,
    starsDisplay: '★'.repeat(roundedRating) + '☆'.repeat(5 - roundedRating)
  };
};
