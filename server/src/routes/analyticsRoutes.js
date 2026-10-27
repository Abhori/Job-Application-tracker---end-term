import express from 'express';
import { getAnalytics } from '../controllers/analyticsController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect); // All analytics are strictly scoped to the authenticated user

router.get('/', getAnalytics);

export default router;
