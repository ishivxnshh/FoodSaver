import FoodListing from '../models/FoodListing.js';
import Notification from '../models/Notification.js';
import { uploadMultipleToCloudinary, deleteFromCloudinary } from '../utils/cloudinaryUpload.js';

// @desc    Create new food listing
// @route   POST /api/listings
// @access  Private
export const createListing = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      quantity,
      servings,
      location,
      pickupTimes,
      expiresAt,
      dietaryInfo,
    } = req.body;

    // Upload images to Cloudinary
    let images = [];
    if (req.files && req.files.length > 0) {
      images = await uploadMultipleToCloudinary(req.files, 'foodsaver/listings');
    }

    // Create listing
    const listing = await FoodListing.create({
      donor: req.user._id,
      title,
      description,
      category,
      quantity,
      servings,
      images,
      location: JSON.parse(location),
      pickupTimes: JSON.parse(pickupTimes),
      expiresAt,
      dietaryInfo: dietaryInfo ? JSON.parse(dietaryInfo) : {},
    });

    // Populate donor info
    await listing.populate('donor', 'name businessName avatar');

    // Send real-time notification to nearby users (simplified)
    const io = req.app.get('io');
    io.emit('new-listing', {
      listing: listing,
      message: `New food available: ${title}`,
    });

    res.status(201).json(listing);
  } catch (error) {
    console.error('Error creating listing:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all food listings with filters
// @route   GET /api/listings
// @access  Public
export const getListings = async (req, res) => {
  try {
    const {
      status = 'available',
      category,
      lat,
      lng,
      radius = 10000, // 10km default
      vegetarian,
      vegan,
      glutenFree,
      limit = 20,
      page = 1,
    } = req.query;

    // Build query
    const query = { status };

    if (category) {
      query.category = category;
    }

    // Dietary filters
    if (vegetarian === 'true') query['dietaryInfo.vegetarian'] = true;
    if (vegan === 'true') query['dietaryInfo.vegan'] = true;
    if (glutenFree === 'true') query['dietaryInfo.glutenFree'] = true;

    // Location-based query
    if (lat && lng) {
      query.location = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)],
          },
          $maxDistance: parseInt(radius),
        },
      };
    }

    const listings = await FoodListing.find(query)
      .populate('donor', 'name businessName avatar location')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await FoodListing.countDocuments(query);

    res.json({
      listings,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      total,
    });
  } catch (error) {
    console.error('Error getting listings:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single food listing
// @route   GET /api/listings/:id
// @access  Public
export const getListing = async (req, res) => {
  try {
    const listing = await FoodListing.findById(req.params.id)
      .populate('donor', 'name businessName avatar phone location address')
      .populate('claimedBy', 'name avatar');

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    // Increment views
    listing.views += 1;
    await listing.save();

    res.json(listing);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update food listing
// @route   PUT /api/listings/:id
// @access  Private
export const updateListing = async (req, res) => {
  try {
    const listing = await FoodListing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    // Check if user is the donor
    if (listing.donor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this listing' });
    }

    // Update fields
    const {
      title,
      description,
      category,
      quantity,
      servings,
      location,
      pickupTimes,
      expiresAt,
      dietaryInfo,
      status,
    } = req.body;

    if (title) listing.title = title;
    if (description) listing.description = description;
    if (category) listing.category = category;
    if (quantity) listing.quantity = quantity;
    if (servings) listing.servings = servings;
    if (location) listing.location = JSON.parse(location);
    if (pickupTimes) listing.pickupTimes = JSON.parse(pickupTimes);
    if (expiresAt) listing.expiresAt = expiresAt;
    if (dietaryInfo) listing.dietaryInfo = JSON.parse(dietaryInfo);
    if (status) listing.status = status;

    // Handle new images
    if (req.files && req.files.length > 0) {
      const newImages = await uploadMultipleToCloudinary(req.files, 'foodsaver/listings');
      listing.images.push(...newImages);
    }

    const updatedListing = await listing.save();
    await updatedListing.populate('donor', 'name businessName avatar');

    res.json(updatedListing);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete food listing
// @route   DELETE /api/listings/:id
// @access  Private
export const deleteListing = async (req, res) => {
  try {
    const listing = await FoodListing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    // Check if user is the donor
    if (listing.donor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this listing' });
    }

    // Delete images from Cloudinary
    if (listing.images && listing.images.length > 0) {
      for (const image of listing.images) {
        await deleteFromCloudinary(image.publicId);
      }
    }

    await listing.deleteOne();

    res.json({ message: 'Listing deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get my listings (donor's listings)
// @route   GET /api/listings/my-listings
// @access  Private
export const getMyListings = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const query = { donor: req.user._id };
    if (status) {
      query.status = status;
    }

    const listings = await FoodListing.find(query)
      .populate('claimedBy', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await FoodListing.countDocuments(query);

    res.json({
      listings,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      total,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete image from listing
// @route   DELETE /api/listings/:id/images/:publicId
// @access  Private
export const deleteListingImage = async (req, res) => {
  try {
    const listing = await FoodListing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    // Check if user is the donor
    if (listing.donor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Find and remove image
    const imageIndex = listing.images.findIndex(
      (img) => img.publicId === req.params.publicId
    );

    if (imageIndex === -1) {
      return res.status(404).json({ message: 'Image not found' });
    }

    // Delete from Cloudinary
    await deleteFromCloudinary(req.params.publicId);

    // Remove from array
    listing.images.splice(imageIndex, 1);
    await listing.save();

    res.json({ message: 'Image deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

