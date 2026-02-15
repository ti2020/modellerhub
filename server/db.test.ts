import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { getDb, getCourses, getEvents, getBatches, getTeamMembers, getCommunityInfo } from './db';
import { courses, events, batches, teamMembers, communityInfo } from '../drizzle/schema';

describe('Database Queries', () => {
  let db: any;

  beforeAll(async () => {
    db = await getDb();
  });

  describe('Courses', () => {
    it('should retrieve all courses', async () => {
      const result = await getCourses();
      expect(Array.isArray(result)).toBe(true);
    });

    it('should retrieve featured courses only', async () => {
      const result = await getCourses(true);
      expect(Array.isArray(result)).toBe(true);
      // All results should have featured = 1 if any exist
      if (result.length > 0) {
        result.forEach((course: any) => {
          expect(course.featured).toBe(1);
        });
      }
    });
  });

  describe('Events', () => {
    it('should retrieve all events', async () => {
      const result = await getEvents();
      expect(Array.isArray(result)).toBe(true);
    });

    it('should retrieve featured events only', async () => {
      const result = await getEvents(true);
      expect(Array.isArray(result)).toBe(true);
      if (result.length > 0) {
        result.forEach((event: any) => {
          expect(event.featured).toBe(1);
        });
      }
    });
  });

  describe('Batches', () => {
    it('should retrieve all batches', async () => {
      const result = await getBatches();
      expect(Array.isArray(result)).toBe(true);
    });

    it('should not include deleted batches', async () => {
      const result = await getBatches();
      result.forEach((batch: any) => {
        expect(batch.deletedAt).toBeNull();
      });
    });
  });

  describe('Team Members', () => {
    it('should retrieve all team members', async () => {
      const result = await getTeamMembers();
      expect(Array.isArray(result)).toBe(true);
    });

    it('should not include deleted team members', async () => {
      const result = await getTeamMembers();
      result.forEach((member: any) => {
        expect(member.deletedAt).toBeNull();
      });
    });

    it('should order team members by order field', async () => {
      const result = await getTeamMembers();
      if (result.length > 1) {
        for (let i = 0; i < result.length - 1; i++) {
          expect(result[i].order).toBeLessThanOrEqual(result[i + 1].order);
        }
      }
    });
  });

  describe('Community Info', () => {
    it('should retrieve community info by key', async () => {
      const result = await getCommunityInfo('mission');
      // Result can be undefined if key doesn't exist, which is valid
      if (result) {
        expect(result.key).toBe('mission');
      }
    });

    it('should handle non-existent keys gracefully', async () => {
      const result = await getCommunityInfo('non_existent_key_12345');
      expect(result).toBeUndefined();
    });
  });

  describe('Data Integrity', () => {
    it('courses should have required fields', async () => {
      const result = await getCourses();
      if (result.length > 0) {
        const course = result[0];
        expect(course).toHaveProperty('id');
        expect(course).toHaveProperty('titleEn');
        expect(course).toHaveProperty('titleAr');
        expect(course).toHaveProperty('createdAt');
        expect(course).toHaveProperty('updatedAt');
      }
    });

    it('events should have required fields', async () => {
      const result = await getEvents();
      if (result.length > 0) {
        const event = result[0];
        expect(event).toHaveProperty('id');
        expect(event).toHaveProperty('titleEn');
        expect(event).toHaveProperty('titleAr');
        expect(event).toHaveProperty('eventDate');
        expect(event).toHaveProperty('createdAt');
      }
    });

    it('batches should have required fields', async () => {
      const result = await getBatches();
      if (result.length > 0) {
        const batch = result[0];
        expect(batch).toHaveProperty('id');
        expect(batch).toHaveProperty('nameEn');
        expect(batch).toHaveProperty('nameAr');
        expect(batch).toHaveProperty('startDate');
        expect(batch).toHaveProperty('enrollmentStatus');
      }
    });
  });
});
