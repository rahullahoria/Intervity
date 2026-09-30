/**
 * Skill Mastery Hook
 * Loads skills from SQLite, calculates Radar Chart polygon vectors, and tracks progress trends
 */

import { useEffect, useState, useCallback } from 'react';
import { CandidateSkill } from '../types';
import { SkillStorageManager } from '../database/SkillStorageManager';
import { SQLiteClient } from '../database/SQLiteClient';

export function useSkillMastery() {
  const [skills, setSkills] = useState<CandidateSkill[]>([]);
  const [weakestSkills, setWeakestSkills] = useState<Array<{ skill_id: string; skill_name: string; current_score: number }>>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const skillDb = new SkillStorageManager();

  const loadSkills = useCallback(async () => {
    setIsLoading(true);
    await SQLiteClient.getInstance().initialize();
    const all = await skillDb.getAllSkills();
    const weak = await skillDb.getWeakestSkills(3);

    if (all.length === 0) {
      // Seed default baseline skills if empty
      const defaultSkills = [
        'React Native',
        'TypeScript',
        'System Design',
        'Distributed Caching',
        'Concurrency & JSI',
        'Communication (STAR)'
      ];
      await skillDb.seedSkillsFromResume(defaultSkills);
      const seeded = await skillDb.getAllSkills();
      setSkills(seeded);
    } else {
      setSkills(all);
    }

    setWeakestSkills(weak);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadSkills();
  }, [loadSkills]);

  return {
    skills,
    weakestSkills,
    isLoading,
    refreshSkills: loadSkills,
  };
}
