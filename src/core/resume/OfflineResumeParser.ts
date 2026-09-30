/**
 * Offline Resume Parser and Context Ingestion Engine
 * Extracts technical candidate profile and skill gaps on-device without cloud APIs
 */

import { ParsedResume } from '../../types';

export class OfflineResumeParser {
  private static TECH_SKILL_KEYWORDS = [
    'React Native', 'TypeScript', 'JavaScript', 'React', 'Node.js', 'Redux', 'Zustand',
    'C++', 'Swift', 'Kotlin', 'Java', 'Python', 'Go', 'Rust',
    'PostgreSQL', 'MongoDB', 'MySQL', 'Redis', 'Cassandra', 'DynamoDB',
    'Kafka', 'RabbitMQ', 'gRPC', 'WebSockets', 'GraphQL', 'REST',
    'Docker', 'Kubernetes', 'AWS', 'GCP', 'CI/CD', 'Terraform',
    'System Design', 'Microservices', 'Distributed Systems', 'DSA',
    'JSI', 'Hermes', 'CoreML', 'Vulkan', 'Audio DSP'
  ];

  static parseResumeText(rawText: string): ParsedResume {
    const text = rawText || '';

    // 1. Extract Candidate Name (First non-empty line or heuristic match)
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    const candidateName = lines.length > 0 ? lines[0].replace(/^(resume|curriculum vitae|cv)\s*:?\s*/i, '') : 'Candidate';

    // 2. Extract Years of Experience
    let yearsOfExperience = 4;
    const expMatch = text.match(/(\d+)\+?\s*(?:years|yrs)\s*(?:of)?\s*experience/i);
    if (expMatch && expMatch[1]) {
      yearsOfExperience = parseInt(expMatch[1], 10);
    }

    // 3. Match Skills from Keyword Dictionary
    const foundSkills = new Set<string>();
    for (const skill of this.TECH_SKILL_KEYWORDS) {
      const escaped = skill.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
      const regex = new RegExp(`\\b${escaped}\\b`, 'i');
      if (regex.test(text)) {
        foundSkills.add(skill);
      }
    }

    // Default fallback skills if none found
    if (foundSkills.size === 0) {
      ['React Native', 'TypeScript', 'System Design', 'Redis', 'Kafka'].forEach(s => foundSkills.add(s));
    }

    // 4. Extract Notable Projects
    const notableProjects: ParsedResume['notableProjects'] = [];
    const projectSections = text.split(/(?:PROJECTS|EXPERIENCE|ACCOMPLISHMENTS)/i);
    if (projectSections.length > 1) {
      const projectText = projectSections[1].slice(0, 800);
      notableProjects.push({
        title: 'Core Production Application',
        techStack: Array.from(foundSkills).slice(0, 4),
        summary: projectText.slice(0, 200).replace(/\s+/g, ' ') + '...',
      });
    } else {
      notableProjects.push({
        title: 'High-Throughput Mobile Engine',
        techStack: ['React Native', 'TypeScript', 'JSI', 'Redis'],
        summary: 'Architected offline-first sync engine and real-time audio processing pipeline.',
      });
    }

    // 5. Detect Potential Knowledge Gaps
    const potentialGaps: string[] = [];
    if (!foundSkills.has('Kafka') && !foundSkills.has('RabbitMQ')) {
      potentialGaps.push('Distributed Messaging (Kafka/RabbitMQ)');
    }
    if (!foundSkills.has('Kubernetes') && !foundSkills.has('Docker')) {
      potentialGaps.push('Containerization & Cloud Orchestration');
    }
    if (!foundSkills.has('Redis') && !foundSkills.has('PostgreSQL')) {
      potentialGaps.push('Advanced Caching & Sharding');
    }

    return {
      candidateName: candidateName.slice(0, 50),
      yearsOfExperience,
      skills: Array.from(foundSkills),
      notableProjects,
      recommendedInterviewTopics: potentialGaps.length > 0 ? potentialGaps : ['System Design Scale', 'Concurrency Hazards'],
      rawText,
    };
  }
}
