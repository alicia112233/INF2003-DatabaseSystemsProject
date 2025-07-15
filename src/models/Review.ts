import mongoose, { Schema, models } from 'mongoose';

const ReviewSchema = new Schema({
    gameId: { type: Number, required: true }, 
    userId: { type: Number, required: true },
    rating: { type: Number, required: true },
    review: { type: String },
    createdAt: { type: Date, default: Date.now }
});

export default models.Review || mongoose.model('review', ReviewSchema);