import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IReview extends Document {
  gameId: number;
  userId: number;
  rating: number;
  review: string;
  createdAt: Date;
}

const ReviewSchema = new Schema<IReview>({
    gameId: { type: Number, required: true }, 
    userId: { type: Number, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    review: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
}, {
    collection: 'reviews' // Explicitly specify collection name
});

// Create the model with proper typing
const Review = mongoose.models.Review as Model<IReview> || mongoose.model<IReview>('Review', ReviewSchema);

export { Review };
export default Review;