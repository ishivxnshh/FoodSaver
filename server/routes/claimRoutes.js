import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  createClaim,
  getMyClaims,
  getReceivedClaims,
  getClaim,
  confirmClaim,
  verifyClaim,
  cancelClaim,
  rateClaim,
} from '../controllers/claimController.js';

const router = express.Router();

// All routes are protected
router.use(protect);

router.post('/', createClaim);
router.get('/my-claims', getMyClaims);
router.get('/received', getReceivedClaims);
router.get('/:id', getClaim);
router.put('/:id/confirm', confirmClaim);
router.post('/:id/verify', verifyClaim);
router.put('/:id/cancel', cancelClaim);
router.post('/:id/rate', rateClaim);

export default router;

