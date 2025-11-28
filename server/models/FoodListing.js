import mongoose from 'mongoose';

const foodListingSchema = new mongoose.Schema(
  {
    donor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ['prepared-food', 'baked-goods', 'fruits-vegetables', 'dairy', 'packaged-food', 'other'],
      required: true,
    },
    quantity: {
      type: String,
      required: true,
    },
    servings: {
      type: Number,
      default: 1,
    },
    images: [{
      url: String,
      publicId: String,
    }],
    location: {
      type: {
        type: String,
        enum: ['Point'],
        required: true,
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
      address: {
        type: String,
        required: true,
      },
    },
    pickupTimes: [{
      start: Date,
      end: Date,
    }],
    expiresAt: {
      type: Date,
      required: true,
    },
    dietaryInfo: {
      vegetarian: { type: Boolean, default: false },
      vegan: { type: Boolean, default: false },
      glutenFree: { type: Boolean, default: false },
      dairyFree: { type: Boolean, default: false },
      nutFree: { type: Boolean, default: false },
    },
    status: {
      type: String,
      enum: ['available', 'claimed', 'expired', 'cancelled'],
      default: 'available',
    },
    claimedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    claimedAt: {
      type: Date,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    views: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Create geospatial index for location-based queries
foodListingSchema.index({ 'location': '2dsphere' });

// Index for efficient queries
foodListingSchema.index({ donor: 1, status: 1 });
foodListingSchema.index({ status: 1, expiresAt: 1 });
foodListingSchema.index({ createdAt: -1 });

// Auto-expire listings
foodListingSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const FoodListing = mongoose.model('FoodListing', foodListingSchema);

export default FoodListing;

