import express from 'express';
import {
  getApplications,
  getApplicationById,
  createApplication,
  updateApplication,
  updateApplicationStatus,
  deleteApplication,
} from '../controllers/applicationController.js';
import { protect } from '../middleware/auth.js';
import {
  validate,
  createApplicationSchema,
  updateApplicationSchema,
  updateStatusSchema,
} from '../middleware/validate.js';

const router = express.Router();

router.use(protect); // All application routes require authentication

router.route('/')
  .get(getApplications)
  .post(validate(createApplicationSchema), createApplication);

router.route('/:id')
  .get(getApplicationById)
  .put(validate(updateApplicationSchema), updateApplication)
  .delete(deleteApplication);

router.patch('/:id/status', validate(updateStatusSchema), updateApplicationStatus);

export default router;
