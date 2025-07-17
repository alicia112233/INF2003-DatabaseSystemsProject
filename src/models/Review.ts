import mongoose, { Schema, models } from 'mongoose';

const ReviewSchema = new Schema({
    userId: { type: String, required: true },
    gameId: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}, {
    timestamps: true
});

// Compound index to ensure one review per user per game
ReviewSchema.index({ userId: 1, gameId: 1 }, { unique: true });

export default models.Review || mongoose.model('Review', ReviewSchema);