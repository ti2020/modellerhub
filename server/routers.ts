import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, publicProcedure, router } from "./_core/trpc";
import {
  getCourses,
  getCourseById,
  getEvents,
  getEventById,
  getBatches,
  getTeamMembers,
  getCommunityInfo,
  getAllCommunityInfo,
  getDb,
} from "./db";
import { z } from "zod";
import { courses, events, batches, teamMembers, communityInfo } from "../drizzle/schema";
import { eq } from "drizzle-orm";

async function requireDb() {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  return db;
}

// Optional text fields: an empty string from a form clears the value.
const optText = z.string().trim().optional();
const reqText = z.string().trim().min(1);
const optDate = z.coerce.date().nullable().optional();
const flag = z.number().int().min(0).max(1);
// A blank number box in the form arrives as null; store 0 instead.
const countOrZero = z.number().int().min(0).nullable().transform(v => v ?? 0);

const courseFields = z.object({
  titleEn: reqText,
  titleAr: reqText,
  descriptionEn: optText,
  descriptionAr: optText,
  duration: optText,
  certification: optText,
  level: z.enum(["beginner", "intermediate", "advanced"]).default("beginner"),
  featured: flag.default(0),
});

const eventFields = z.object({
  titleEn: reqText,
  titleAr: reqText,
  descriptionEn: optText,
  descriptionAr: optText,
  eventDate: z.coerce.date(),
  eventTime: optText,
  topic: optText,
  speaker: optText,
  location: optText,
  featured: flag.default(0),
});

const batchFields = z.object({
  nameEn: reqText,
  nameAr: reqText,
  descriptionEn: optText,
  descriptionAr: optText,
  startDate: z.coerce.date(),
  endDate: optDate,
  enrollmentStatus: z.enum(["open", "closed", "full"]).default("open"),
  capacity: z.number().int().min(0).nullable().optional(),
  enrolled: countOrZero.default(0),
});

const teamFields = z.object({
  nameEn: reqText,
  nameAr: reqText,
  bioEn: optText,
  bioAr: optText,
  credentials: optText,
  photoUrl: z.union([z.string().trim().url(), z.literal("")]).optional(),
  role: z.enum(["founder", "admin", "mentor"]).default("mentor"),
  order: countOrZero.default(0),
});

const idInput = z.object({ id: z.number().int().positive() });

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  admin: router({
    // Courses
    createCourse: adminProcedure.input(courseFields).mutation(async ({ input }) => {
      const db = await requireDb();
      await db.insert(courses).values(input);
      return { success: true };
    }),
    updateCourse: adminProcedure
      .input(courseFields.partial().merge(idInput))
      .mutation(async ({ input }) => {
        const db = await requireDb();
        const { id, ...data } = input;
        await db.update(courses).set(data).where(eq(courses.id, id));
        return { success: true };
      }),
    deleteCourse: adminProcedure.input(idInput).mutation(async ({ input }) => {
      const db = await requireDb();
      await db.update(courses).set({ deletedAt: new Date() }).where(eq(courses.id, input.id));
      return { success: true };
    }),

    // Events
    createEvent: adminProcedure.input(eventFields).mutation(async ({ input }) => {
      const db = await requireDb();
      await db.insert(events).values(input);
      return { success: true };
    }),
    updateEvent: adminProcedure
      .input(eventFields.partial().merge(idInput))
      .mutation(async ({ input }) => {
        const db = await requireDb();
        const { id, ...data } = input;
        await db.update(events).set(data).where(eq(events.id, id));
        return { success: true };
      }),
    deleteEvent: adminProcedure.input(idInput).mutation(async ({ input }) => {
      const db = await requireDb();
      await db.update(events).set({ deletedAt: new Date() }).where(eq(events.id, input.id));
      return { success: true };
    }),

    // Batches
    createBatch: adminProcedure.input(batchFields).mutation(async ({ input }) => {
      const db = await requireDb();
      await db.insert(batches).values(input);
      return { success: true };
    }),
    updateBatch: adminProcedure
      .input(batchFields.partial().merge(idInput))
      .mutation(async ({ input }) => {
        const db = await requireDb();
        const { id, ...data } = input;
        await db.update(batches).set(data).where(eq(batches.id, id));
        return { success: true };
      }),
    deleteBatch: adminProcedure.input(idInput).mutation(async ({ input }) => {
      const db = await requireDb();
      await db.update(batches).set({ deletedAt: new Date() }).where(eq(batches.id, input.id));
      return { success: true };
    }),

    // Team members
    createTeamMember: adminProcedure.input(teamFields).mutation(async ({ input }) => {
      const db = await requireDb();
      await db.insert(teamMembers).values(input);
      return { success: true };
    }),
    updateTeamMember: adminProcedure
      .input(teamFields.partial().merge(idInput))
      .mutation(async ({ input }) => {
        const db = await requireDb();
        const { id, ...data } = input;
        await db.update(teamMembers).set(data).where(eq(teamMembers.id, id));
        return { success: true };
      }),
    deleteTeamMember: adminProcedure.input(idInput).mutation(async ({ input }) => {
      const db = await requireDb();
      await db.update(teamMembers).set({ deletedAt: new Date() }).where(eq(teamMembers.id, input.id));
      return { success: true };
    }),

    // Community info (mission, vision, modeling field): one row per key
    getAllCommunityInfo: adminProcedure.query(async () => {
      return await getAllCommunityInfo();
    }),
    saveCommunityInfo: adminProcedure
      .input(z.object({
        key: z.enum(["mission", "vision", "modeling_field"]),
        titleEn: optText,
        titleAr: optText,
        contentEn: optText,
        contentAr: optText,
      }))
      .mutation(async ({ input }) => {
        const db = await requireDb();
        const { key, ...data } = input;
        await db.insert(communityInfo).values(input).onDuplicateKeyUpdate({ set: data });
        return { success: true };
      }),
  }),

  content: router({
    getFeaturedCourses: publicProcedure.query(async () => {
      return await getCourses(true);
    }),
    getAllCourses: publicProcedure.query(async () => {
      return await getCourses();
    }),
    getCourseById: publicProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      return await getCourseById(input.id);
    }),
    getFeaturedEvents: publicProcedure.query(async () => {
      return await getEvents(true);
    }),
    getAllEvents: publicProcedure.query(async () => {
      return await getEvents();
    }),
    getEventById: publicProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      return await getEventById(input.id);
    }),
    getBatches: publicProcedure.query(async () => {
      return await getBatches();
    }),
    getTeamMembers: publicProcedure.query(async () => {
      return await getTeamMembers();
    }),
    getCommunityInfo: publicProcedure.input(z.object({ key: z.string() })).query(async ({ input }) => {
      return await getCommunityInfo(input.key);
    }),
  }),
});

export type AppRouter = typeof appRouter;
