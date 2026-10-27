import express from 'express';
import {
  getEvents,
  createEvent,
  updateEvent,
  toggleEventCompletion,
  deleteEvent,
} from '../controllers/eventController.js';
import { protect } from '../middleware/auth.js';
import {
  validate,
  createEventSchema,
  updateEventSchema,
} from '../middleware/validate.js';

const router = express.Router();

router.use(protect); // All event routes require authentication

router.route('/')
  .get(getEvents)
  .post(validate(createEventSchema), createEvent);

router.route('/:id')
  .put(validate(updateEventSchema), updateEvent)
  .delete(deleteEvent);

router.patch('/:id/toggle', toggleEventCompletion);

export default router;
