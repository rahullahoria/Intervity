import test from 'node:test';
import assert from 'node:assert';
import { OfflineResumeParser } from '../src/core/resume/OfflineResumeParser';

test('Offline Resume Parser Skill & Gap Extraction', () => {
  const sampleResume = `
Pooja Patel
Senior Software Engineer | Hyderabad, India
Education: B.Tech in CSE, NIT Warangal
Experience: 5+ years of experience building mobile & cloud systems.

Skills:
React Native, TypeScript, JSI, C++, Redis, PostgreSQL, Docker, DSA.

Projects:
Built real-time offline payment SDK supporting 10k transactions/sec.
`;

  const parsed = OfflineResumeParser.parseResumeText(sampleResume);

  assert.strictEqual(parsed.candidateName, 'Pooja Patel');
  assert.strictEqual(parsed.yearsOfExperience, 5);
  assert.ok(parsed.skills.includes('React Native'));
  assert.ok(parsed.skills.includes('TypeScript'));
  assert.ok(parsed.skills.includes('Redis'));
  assert.ok(parsed.skills.includes('PostgreSQL'));

  // Detected knowledge gap (e.g. Kafka/RabbitMQ not in resume)
  assert.ok(parsed.recommendedInterviewTopics.some(t => t.includes('Kafka') || t.includes('System Design')));
});
