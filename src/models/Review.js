const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  gameId: { type: String, required: true },
  userId: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  review: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.Review || mongoose.model('Review', reviewSchema);
