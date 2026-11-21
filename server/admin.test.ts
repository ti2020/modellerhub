import { describe, it, expect } from 'vitest';
import { appRouter } from './routers';
import type { TrpcContext } from './_core/context';

function ctxFor(role: 'admin' | 'user' | null): TrpcContext {
  const user =
    role === null
      ? null
      : {
          id: role === 'admin' ? 1 : 2,
          openId: `${role}-user`,
          email: `${role}@example.com`,
          name: role,
          loginMethod: 'google',
          role,
          createdAt: new Date(),
          updatedAt: new Date(),
          lastSignedIn: new Date(),
        };
  return {
    user,
    req: { protocol: 'https', headers: {} } as TrpcContext['req'],
    res: {} as TrpcContext['res'],
  } as TrpcContext;
}

const samples = {
  createCourse: { titleEn: 'AFM', titleAr: 'نموذج' },
  createEvent: { titleEn: 'Orientation', titleAr: 'الجلسة التعريفية', eventDate: new Date('2026-12-05T12:00:00') },
  createBatch: { nameEn: 'Batch 1 · Sun', nameAr: 'الدفعة 1', startDate: new Date('2026-12-12T12:00:00') },
  createTeamMember: { nameEn: 'Tarig', nameAr: 'طارق' },
  saveCommunityInfo: { key: 'mission' as const, contentEn: 'Mission text' },
};

type Name = keyof typeof samples;
const names = Object.keys(samples) as Name[];

async function call(role: 'admin' | 'user' | null, name: Name, input: unknown) {
  const caller = appRouter.createCaller(ctxFor(role)) as any;
  return caller.admin[name](input);
}

describe('Admin content endpoints', () => {
  for (const name of names) {
    it(`${name}: refuses signed-out visitors`, async () => {
      await expect(call(null, name, samples[name])).rejects.toThrow(/permission/i);
    });

    it(`${name}: refuses non-admin users`, async () => {
      await expect(call('user', name, samples[name])).rejects.toThrow(/permission/i);
    });

    it(`${name}: accepts valid admin input (fails only on the missing test database)`, async () => {
      await expect(call('admin', name, samples[name])).rejects.toThrow(/Database unavailable/);
    });
  }

  it('rejects blank required names and titles', async () => {
    await expect(call('admin', 'createCourse', { titleEn: '  ', titleAr: 'x' })).rejects.toThrow(/too_small|at least/i);
    await expect(call('admin', 'createBatch', { nameEn: '', nameAr: 'x', startDate: new Date() })).rejects.toThrow(
      /too_small|at least/i,
    );
  });

  it('requires a valid date for events and batches', async () => {
    await expect(call('admin', 'createEvent', { titleEn: 'a', titleAr: 'b', eventDate: 'not a date' })).rejects.toThrow(
      /date/i,
    );
    await expect(call('admin', 'createBatch', { nameEn: 'a', nameAr: 'b', startDate: null })).rejects.toThrow();
  });

  it('treats blank seat counts as zero rather than rejecting them', async () => {
    await expect(
      call('admin', 'createBatch', { ...samples.createBatch, capacity: null, enrolled: null }),
    ).rejects.toThrow(/Database unavailable/);
  });

  it('only allows known community info sections', async () => {
    await expect(call('admin', 'saveCommunityInfo', { key: 'pricing', contentEn: 'x' })).rejects.toThrow(/invalid/i);
  });

  it('rejects a photo link that is not a web address', async () => {
    await expect(call('admin', 'createTeamMember', { ...samples.createTeamMember, photoUrl: 'my photo' })).rejects.toThrow(
      /url/i,
    );
  });

  it('update and delete also require admin', async () => {
    for (const name of ['updateEvent', 'deleteEvent', 'updateBatch', 'deleteBatch', 'updateTeamMember', 'deleteTeamMember']) {
      await expect((appRouter.createCaller(ctxFor('user')) as any).admin[name]({ id: 1 })).rejects.toThrow(/permission/i);
    }
  });
});
