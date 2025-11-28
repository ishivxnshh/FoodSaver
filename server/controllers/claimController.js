import Claim from '../models/Claim.js';
import FoodListing from '../models/FoodListing.js';
import Notification from '../models/Notification.js';
import { generateQRCode, generateVerificationCode } from '../utils/qrcode.js';

// @desc    Create a claim for a food listing
// @route   POST /api/claims
// @access  Private
export const createClaim = async (req, res) => {
  try {
    const { foodListingId, pickupTime } = req.body;

    // Find the listing
    const listing = await FoodListing.findById(foodListingId).populate('donor');

    if (!listing) {
      return res.status(404).json({ message: 'Food listing not found' });
    }

    // Check if listing is available
    if (listing.status !== 'available') {
      return res.status(400).json({ message: 'This listing is no longer available' });
    }

    // Check if user is not the donor
    if (listing.donor._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot claim your own listing' });
    }

    // Generate verification code and QR code
    const verificationCode = generateVerificationCode();
    const qrCodeData = {
      claimId: null, // Will be updated after creation
      foodListingId: listing._id,
      claimerId: req.user._id,
      donorId: listing.donor._id,
      verificationCode,
    };

    // Create claim
    const claim = await Claim.create({
      foodListing: foodListingId,
      claimer: req.user._id,
      donor: listing.donor._id,
      pickupTime,
      qrCode: '', // Temporary
      verificationCode,
      status: 'pending',
    });

    // Update QR code with claim ID
    qrCodeData.claimId = claim._id.toString();
    const qrCode = await generateQRCode(qrCodeData);
    claim.qrCode = qrCode;
    await claim.save();

    // Update listing status
    listing.status = 'claimed';
    listing.claimedBy = req.user._id;
    listing.claimedAt = new Date();
    await listing.save();

    // Create notifications
    await Notification.create({
      user: listing.donor._id,
      type: 'claim-request',
      title: 'New Claim Request',
      message: `${req.user.name} has claimed your food listing: ${listing.title}`,
      relatedListing: listing._id,
      relatedClaim: claim._id,
    });

    // Send real-time notification via Socket.io
    const io = req.app.get('io');
    io.to(`user-${listing.donor._id}`).emit('new-claim', {
      claim,
      claimer: req.user,
      listing,
    });

    // Populate and return
    await claim.populate([
      { path: 'foodListing', select: 'title images location' },
      { path: 'claimer', select: 'name avatar phone' },
      { path: 'donor', select: 'name businessName avatar phone location' },
    ]);

    res.status(201).json(claim);
  } catch (error) {
    console.error('Error creating claim:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get my claims (as receiver)
// @route   GET /api/claims/my-claims
// @access  Private
export const getMyClaims = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const query = { claimer: req.user._id };
    if (status) {
      query.status = status;
    }

    const claims = await Claim.find(query)
      .populate('foodListing', 'title images location expiresAt')
      .populate('donor', 'name businessName avatar phone location address')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Claim.countDocuments(query);

    res.json({
      claims,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      total,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get claims for my listings (as donor)
// @route   GET /api/claims/received
// @access  Private
export const getReceivedClaims = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const query = { donor: req.user._id };
    if (status) {
      query.status = status;
    }

    const claims = await Claim.find(query)
      .populate('foodListing', 'title images location')
      .populate('claimer', 'name avatar phone')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Claim.countDocuments(query);

    res.json({
      claims,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      total,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single claim
// @route   GET /api/claims/:id
// @access  Private
export const getClaim = async (req, res) => {
  try {
    const claim = await Claim.findById(req.params.id)
      .populate('foodListing')
      .populate('claimer', 'name avatar phone')
      .populate('donor', 'name businessName avatar phone location address');

    if (!claim) {
      return res.status(404).json({ message: 'Claim not found' });
    }

    // Check authorization
    if (
      claim.claimer._id.toString() !== req.user._id.toString() &&
      claim.donor._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: 'Not authorized to view this claim' });
    }

    res.json(claim);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Confirm claim (donor confirms)
// @route   PUT /api/claims/:id/confirm
// @access  Private
export const confirmClaim = async (req, res) => {
  try {
    const claim = await Claim.findById(req.params.id)
      .populate('claimer', 'name')
      .populate('foodListing', 'title');

    if (!claim) {
      return res.status(404).json({ message: 'Claim not found' });
    }

    // Check if user is the donor
    if (claim.donor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    claim.status = 'confirmed';
    await claim.save();

    // Notify claimer
    await Notification.create({
      user: claim.claimer._id,
      type: 'claim-confirmed',
      title: 'Claim Confirmed',
      message: `Your claim for "${claim.foodListing.title}" has been confirmed!`,
      relatedListing: claim.foodListing._id,
      relatedClaim: claim._id,
    });

    // Real-time notification
    const io = req.app.get('io');
    io.to(`user-${claim.claimer._id}`).emit('claim-confirmed', claim);

    res.json(claim);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify claim with QR code (complete pickup)
// @route   POST /api/claims/:id/verify
// @access  Private
export const verifyClaim = async (req, res) => {
  try {
    const { verificationCode } = req.body;
    const claim = await Claim.findById(req.params.id);

    if (!claim) {
      return res.status(404).json({ message: 'Claim not found' });
    }

    // Check if user is the donor
    if (claim.donor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the donor can verify the claim' });
    }

    // Verify code
    if (claim.verificationCode !== verificationCode.toUpperCase()) {
      return res.status(400).json({ message: 'Invalid verification code' });
    }

    // Update claim
    claim.status = 'completed';
    claim.verifiedAt = new Date();
    claim.completedAt = new Date();
    await claim.save();

    // Update listing
    await FoodListing.findByIdAndUpdate(claim.foodListing, {
      completedAt: new Date(),
    });

    // Notify claimer
    await Notification.create({
      user: claim.claimer,
      type: 'claim-completed',
      title: 'Pickup Completed',
      message: 'Your food pickup has been verified. Thank you for reducing food waste!',
      relatedListing: claim.foodListing,
      relatedClaim: claim._id,
    });

    // Real-time notification
    const io = req.app.get('io');
    io.to(`user-${claim.claimer}`).emit('claim-completed', claim);

    res.json({ message: 'Claim verified successfully', claim });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Cancel claim
// @route   PUT /api/claims/:id/cancel
// @access  Private
export const cancelClaim = async (req, res) => {
  try {
    const { reason } = req.body;
    const claim = await Claim.findById(req.params.id)
      .populate('claimer', 'name')
      .populate('donor', 'name')
      .populate('foodListing', 'title');

    if (!claim) {
      return res.status(404).json({ message: 'Claim not found' });
    }

    // Check authorization (both claimer and donor can cancel)
    if (
      claim.claimer._id.toString() !== req.user._id.toString() &&
      claim.donor.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    claim.status = 'cancelled';
    claim.cancelledBy = req.user._id;
    claim.cancelReason = reason || '';
    await claim.save();

    // Make listing available again
    await FoodListing.findByIdAndUpdate(claim.foodListing._id, {
      status: 'available',
      claimedBy: null,
      claimedAt: null,
    });

    // Notify the other party
    const notifyUserId =
      claim.claimer._id.toString() === req.user._id.toString()
        ? claim.donor
        : claim.claimer._id;

    await Notification.create({
      user: notifyUserId,
      type: 'claim-cancelled',
      title: 'Claim Cancelled',
      message: `The claim for "${claim.foodListing.title}" has been cancelled.`,
      relatedListing: claim.foodListing._id,
      relatedClaim: claim._id,
    });

    // Real-time notification
    const io = req.app.get('io');
    io.to(`user-${notifyUserId}`).emit('claim-cancelled', claim);

    res.json({ message: 'Claim cancelled successfully', claim });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Rate a completed claim
// @route   POST /api/claims/:id/rate
// @access  Private
export const rateClaim = async (req, res) => {
  try {
    const { score, review } = req.body;
    const claim = await Claim.findById(req.params.id);

    if (!claim) {
      return res.status(404).json({ message: 'Claim not found' });
    }

    // Check if user is the claimer
    if (claim.claimer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the claimer can rate' });
    }

    // Check if claim is completed
    if (claim.status !== 'completed') {
      return res.status(400).json({ message: 'Can only rate completed claims' });
    }

    // Check if already rated
    if (claim.rating && claim.rating.score) {
      return res.status(400).json({ message: 'Claim already rated' });
    }

    claim.rating = {
      score,
      review,
      createdAt: new Date(),
    };

    await claim.save();

    res.json({ message: 'Rating submitted successfully', claim });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

