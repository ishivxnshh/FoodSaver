import mongoose from 'mongoose';

const claimSchema = new mongoose.Schema(
  {
    foodListing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FoodListing',
      required: true,
    },
    claimer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    donor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'completed', 'cancelled', 'no-show'],
      default: 'pending',
    },
    pickupTime: {
      type: Date,
      required: true,
    },
    qrCode: {
      type: String,
      required: true,
      unique: true,
    },
    verificationCode: {
      type: String,
      required: true,
    },
    verifiedAt: {
      type: Date,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    cancelReason: {
      type: String,
      default: '',
    },
    rating: {
      score: { type: Number, min: 1, max: 5 },
      review: String,
      createdAt: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
claimSchema.index({ claimer: 1, createdAt: -1 });
claimSchema.index({ donor: 1, createdAt: -1 });
claimSchema.index({ foodListing: 1 });
// qrCode index is automatically created by unique: true, no need to duplicate
claimSchema.index({ status: 1, pickupTime: 1 });

const Claim = mongoose.model('Claim', claimSchema);

export default Claim;

