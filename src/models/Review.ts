import mongoose, { Schema, models } from 'mongoose';

const ReviewSchema = new Schema({
  userId: { type: String, required: true },
  gameId: { type: String, required: true },
  rating: { type: Number, required: true },
  comment: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export default models.Review || mongoose.model('Review', ReviewSchema);
