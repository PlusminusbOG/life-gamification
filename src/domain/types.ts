/**
 * Ubiquitous domain models for Life Gamification
 * Strictly conforms to GLOSSARY.md and docs/research/02-dexie-schema-and-export.md
 */

export interface Activity {
  id: string; // UUID
  name: string; // Unique pursuit name (e.g., "Reading", "Running", "Coding")
  totalMinutes: number; // Cumulative minutes spent (never decreases)
  level: number; // Derived RPG level
  icon?: string; // Optional icon identifier
  color?: string; // Optional hex/tailwind color
  createdAt: number; // Epoch ms
  updatedAt: number; // Epoch ms
}

export interface TimeLog {
  id: string; // UUID
  activityId: string; // Foreign key -> Activity.id
  durationMinutes: number; // Logged session duration in minutes
  timestamp: number; // Epoch ms when session completed
  notes?: string; // Optional session reflection / notes
  createdAt: number; // Epoch ms
}

export interface UserProfile {
  id: string; // Singleton key: 'me'
  name: string; // Hero name
  totalMinutes: number; // Cumulative all-time hero minutes (never decreases, prevents rounding drift)
  totalHours: number; // Cumulative all-time hero hours (never decreases)
  createdAt: number; // Epoch ms
  updatedAt: number; // Epoch ms
}

export type PantheonTier =
  | 'Mortal'
  | 'Hero of Hellas'
  | 'Demigod'
  | 'Titan of Will'
  | 'Olympian'
  | 'Ascendant God';

export interface PantheonTierInfo {
  tier: PantheonTier;
  title: string;
  minLevel: number;
  maxLevel: number;
}

export interface HeroState {
  profile: UserProfile;
  activities: Activity[];
}

export interface CreateActivityInput {
  name: string;
  icon?: string;
  color?: string;
}

export interface LogTimeInput {
  activityId: string;
  durationMinutes: number;
  notes?: string;
  timestamp?: number;
}
