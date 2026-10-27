import { SKILLS_DICTIONARY } from '../utils/skillsDictionary.js';

/**
 * Escapes regex special characters except those commonly used in language names (like +, #)
 */
const escapeRegex = (str) => {
  return str.replace(/[-[\]/{}()*?.\^$|]/g, '\\$&');
};

/**
 * Build a compiled regex pattern for an alias that honors word boundaries
 * Special handling for C++, C#, .NET, Go
 */
const buildAliasPattern = (alias) => {
  const normalized = alias.trim().toLowerCase();

  // If alias already specifies boundaries or regex
  if (normalized.startsWith('\\b') && normalized.endsWith('\\b')) {
    return new RegExp(normalized, 'i');
  }

  if (normalized === 'c++') {
    return /(?:^|[\s,;/()[\].])c\+\+(?:$|[\s,;/()[\].])/i;
  }
  if (normalized === 'c#') {
    return /(?:^|[\s,;/()[\].])c#(?:$|[\s,;/()[\].])/i;
  }
  if (normalized === '.net') {
    return /(?:^|[\s,;/()[\].])\.net(?:$|[\s,;/()[\].])/i;
  }
  if (normalized === 'c') {
    return /(?:^|[\s,;/()[\].])c(?:$|[\s,;/()[\].])/i;
  }

  const escaped = escapeRegex(normalized);
  return new RegExp(`(?:^|[\\s,;/()\\[\\]{}:.-])${escaped}(?:$|[\\s,;/()\\[\\]{}:.-])`, 'i');
};

/**
 * Extract skills from raw text using deterministic matching against the dictionary
 */
export const extractSkills = (rawText = '') => {
  if (!rawText || typeof rawText !== 'string') {
    return [];
  }

  const textToScan = ` ${rawText.toLowerCase()} `;
  const detectedSkills = [];

  for (const skill of SKILLS_DICTIONARY) {
    let matched = false;
    for (const alias of skill.aliases) {
      const pattern = buildAliasPattern(alias);
      if (pattern.test(textToScan)) {
        matched = true;
        break;
      }
    }

    if (matched) {
      detectedSkills.push({
        name: skill.name,
        category: skill.category,
        priorityLevel: skill.priorityLevel,
        learningTip: skill.learningTip,
      });
    }
  }

  return detectedSkills;
};

/**
 * Compare Job Description text with Resume text
 */
export const compareJobAndResume = (jobDescriptionText, resumeText) => {
  const jdSkills = extractSkills(jobDescriptionText);
  const resumeSkills = extractSkills(resumeText);

  const resumeSkillNames = new Set(resumeSkills.map((s) => s.name));
  const jdSkillNames = new Set(jdSkills.map((s) => s.name));

  const matchedSkills = jdSkills.filter((s) => resumeSkillNames.has(s.name));
  const missingSkills = jdSkills.filter((s) => !resumeSkillNames.has(s.name));
  const additionalResumeSkills = resumeSkills.filter((s) => !jdSkillNames.has(s.name));

  const totalJdSkills = jdSkills.length;
  const matchPercentage = totalJdSkills > 0
    ? Math.round((matchedSkills.length / totalJdSkills) * 100)
    : 0;

  // Group missing skills by priority for actionable recommendations
  const learningPriorities = {
    high: missingSkills.filter((s) => s.priorityLevel === 'High'),
    medium: missingSkills.filter((s) => s.priorityLevel === 'Medium'),
    foundational: missingSkills.filter((s) => s.priorityLevel === 'Foundational'),
  };

  return {
    matchPercentage,
    totalJdSkillsDetected: totalJdSkills,
    totalResumeSkillsDetected: resumeSkills.length,
    matchedCount: matchedSkills.length,
    missingCount: missingSkills.length,
    matchedSkills,
    missingSkills,
    additionalResumeSkills,
    learningPriorities,
    disclaimer:
      'Deterministic skill matching is based on explicit keywords and synonyms found in your text. A skill not detected in the supplied resume is not necessarily a skill you lack. Always verify that your resume accurately portrays your true hands-on experience.',
  };
};
