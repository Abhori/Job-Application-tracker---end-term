import express from 'express';
import {
  analyzeJobAndResume,
  extractSkillsFromText,
  getSupportedSkills,
} from '../controllers/skillController.js';
import { protect } from '../middleware/auth.js';
import { validate, compareSkillsSchema } from '../middleware/validate.js';

const router = express.Router();

router.use(protect); // Require auth for skill analysis

router.post('/compare', validate(compareSkillsSchema), analyzeJobAndResume);
router.post('/extract', extractSkillsFromText);
router.get('/dictionary', getSupportedSkills);

export default router;
