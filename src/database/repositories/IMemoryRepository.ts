import { MascotProfile } from '../../core/agent/AgentCoachingHarness';

export interface MemoryFactRecord {
  memoryId: string;
  category: string;
  factKey: string;
  factValue: string;
  confidence: number;
  createdAt: number;
  lastReferencedAt: number;
}

/**
 * Repository Contract for Long-Term Career Memory and Mascot Profiles
 * (Repository Pattern)
 */
export interface IMemoryRepository {
  getMascotProfile(id?: string): Promise<MascotProfile | null>;
  saveMascotProfile(profile: MascotProfile): Promise<void>;
  updateMascotProfile(profile: MascotProfile): Promise<void>;
  saveMemoryFact(category: string, key: string, value: string, confidence?: number): Promise<void>;
  getAllMemoryFacts(): Promise<MemoryFactRecord[]>;
  clearMemoryFacts(): Promise<void>;
}
