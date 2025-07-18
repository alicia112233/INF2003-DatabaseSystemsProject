import mongoose, { Schema, models } from 'mongoose';

const ReviewSchema = new Schema({
    userId: { type: Number, required: true },
    gameId: { type: Number, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    review: { type: String, default: '' }, // Using 'review' field as primary
    comment: { type: String, default: '' }, // Keep for backward compatibility
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}, {
    timestamps: true
});

// Virtual field to get the review text from either review or comment field
ReviewSchema.virtual('reviewText').get(function() {
    return this.review || this.comment || '';
});

// Compound index to ensure one review per user per game
ReviewSchema.index({ userId: 1, gameId: 1 }, { unique: true });

// Ensure virtual fields are serialized
ReviewSchema.set('toJSON', { virtuals: true });
ReviewSchema.set('toObject', { virtuals: true });

export default models.Review || mongoose.model('Review', ReviewSchema);