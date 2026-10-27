import { compareJobAndResume, extractSkills } from '../services/skillMatcher.js';
import { SKILLS_DICTIONARY } from '../utils/skillsDictionary.js';

export const analyzeJobAndResume = async (req, res, next) => {
  try {
    const { jobDescription, resumeText } = req.body;

    const analysis = compareJobAndResume(jobDescription, resumeText);

    res.status(200).json({
      success: true,
      data: analysis,
    });
  } catch (error) {
    next(error);
  }
};

export const extractSkillsFromText = async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!text || typeof text !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Text must be provided as a string',
      });
    }

    const detected = extractSkills(text);

    res.status(200).json({
      success: true,
      data: detected,
      totalCount: detected.length,
    });
  } catch (error) {
    next(error);
  }
};

export const getSupportedSkills = async (req, res) => {
  // Returns supported skills grouped by category
  const categories = {};
  SKILLS_DICTIONARY.forEach((skill) => {
    if (!categories[skill.category]) {
      categories[skill.category] = [];
    }
    categories[skill.category].push({
      name: skill.name,
      priorityLevel: skill.priorityLevel,
    });
  });

  res.status(200).json({
    success: true,
    data: {
      totalSkillsTracked: SKILLS_DICTIONARY.length,
      categories,
    },
  });
};
