import Claim from '../models/Claim.js';
import FoodListing from '../models/FoodListing.js';

// Get user statistics
export const getUserStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    let stats = {
      foodSaved: 0,
      co2Reduced: 0,
      impactScore: 0,
    };

    if (userRole === 'donor' || userRole === 'both') {
      // Count completed claims where user is the donor
      const completedClaims = await Claim.find({
        donor: userId,
        status: 'completed',
      }).populate('foodListing');

      stats.foodSaved = completedClaims.length;

      // Calculate servings from completed claims
      let totalServings = 0;
      for (const claim of completedClaims) {
        if (claim.foodListing && claim.foodListing.servings) {
          totalServings += claim.foodListing.servings;
        }
      }

      // Estimate CO2 reduction: ~2.5 kg CO2 per serving (average)
      stats.co2Reduced = Math.round(totalServings * 2.5 * 10) / 10; // Round to 1 decimal
      
      // Impact score: combination of items and servings
      stats.impactScore = stats.foodSaved * 10 + totalServings;
    }

    if (userRole === 'receiver' || userRole === 'both') {
      // Count completed claims where user is the receiver
      const receivedClaims = await Claim.find({
        claimer: userId,
        status: 'completed',
      }).populate('foodListing');

      const receivedCount = receivedClaims.length;
      stats.foodSaved += receivedCount;

      // Calculate servings from received claims
      let totalServings = 0;
      for (const claim of receivedClaims) {
        if (claim.foodListing && claim.foodListing.servings) {
          totalServings += claim.foodListing.servings;
        }
      }

      // Add to CO2 reduction
      const additionalCO2 = Math.round(totalServings * 2.5 * 10) / 10;
      stats.co2Reduced += additionalCO2;

      // Add to impact score
      stats.impactScore += receivedCount * 10 + totalServings;
    }

    res.json(stats);
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ message: 'Failed to fetch statistics' });
  }
};

// Get global platform statistics (optional)
export const getGlobalStats = async (req, res) => {
  try {
    const totalListings = await FoodListing.countDocuments();
    const completedClaims = await Claim.countDocuments({ status: 'completed' });
    const activeDonors = await FoodListing.distinct('donor').length;
    const activeReceivers = await Claim.distinct('claimer').length;

    // Calculate total servings from completed claims
    const claims = await Claim.find({ status: 'completed' }).populate('foodListing');
    let totalServings = 0;
    for (const claim of claims) {
      if (claim.foodListing && claim.foodListing.servings) {
        totalServings += claim.foodListing.servings;
      }
    }

    const globalCO2 = Math.round(totalServings * 2.5 * 10) / 10;

    res.json({
      totalListings,
      completedClaims,
      activeDonors,
      activeReceivers,
      totalServings,
      co2Reduced: globalCO2,
    });
  } catch (error) {
    console.error('Error fetching global stats:', error);
    res.status(500).json({ message: 'Failed to fetch global statistics' });
  }
};
