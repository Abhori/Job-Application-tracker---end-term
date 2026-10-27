import { extractSkills, compareJobAndResume } from '../src/services/skillMatcher.js';

describe('Deterministic Skill Matcher Engine', () => {
  it('should extract common technical skills with normalization and alias mapping', () => {
    const sampleText = `
      We are looking for a Full Stack Engineer experienced in React.js, Node.js, Express,
      TypeScript, and MongoDB. Experience with C++, Docker containers, and Git is a plus.
    `;

    const extracted = extractSkills(sampleText);
    const skillNames = extracted.map((s) => s.name);

    expect(skillNames).toContain('React');
    expect(skillNames).toContain('Node.js');
    expect(skillNames).toContain('Express');
    expect(skillNames).toContain('TypeScript');
    expect(skillNames).toContain('MongoDB');
    expect(skillNames).toContain('C++');
    expect(skillNames).toContain('Docker');
    expect(skillNames).toContain('Git');
  });

  it('should avoid false positives on substring matches (e.g. "go" in "good")', () => {
    const textWithoutGo = 'Good afternoon, we have got great news regarding your job position.';
    const extracted = extractSkills(textWithoutGo);
    const names = extracted.map((s) => s.name);

    expect(names).not.toContain('Go');
  });

  it('should calculate transparent match percentage, missing skills, and priority levels', () => {
    const jobDescription = `
      Required Qualifications:
      - Proficient in JavaScript, React, and CSS.
      - Experience building REST APIs with Node.js and Express.
      - Familiarity with PostgreSQL and Docker.
    `;

    const resumeText = `
      Ameey Raj — Software Engineer
      Skills: JavaScript, React, CSS, HTML, Python, Git.
      Projects:
      Built a responsive web dashboard using React and Tailwind CSS.
    `;

    const result = compareJobAndResume(jobDescription, resumeText);

    expect(result.totalJdSkillsDetected).toBeGreaterThan(0);
    expect(result.matchedSkills.map((s) => s.name)).toContain('JavaScript');
    expect(result.matchedSkills.map((s) => s.name)).toContain('React');
    expect(result.matchedSkills.map((s) => s.name)).toContain('CSS');

    expect(result.missingSkills.map((s) => s.name)).toContain('Node.js');
    expect(result.missingSkills.map((s) => s.name)).toContain('Express');
    expect(result.missingSkills.map((s) => s.name)).toContain('PostgreSQL');
    expect(result.missingSkills.map((s) => s.name)).toContain('Docker');

    expect(result.additionalResumeSkills.map((s) => s.name)).toContain('Python');
    expect(result.additionalResumeSkills.map((s) => s.name)).toContain('Git');

    expect(result.matchPercentage).toBeGreaterThan(0);
    expect(result.matchPercentage).toBeLessThan(100);
    expect(result.learningPriorities.high.length).toBeGreaterThan(0);
    expect(result.disclaimer).toBeDefined();
  });
});
