import { COOKIE_NAME } from "@shared/const";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { batches, communityInfo, courses, events, teamMembers } from "../drizzle/schema";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, publicProcedure, router } from "./_core/trpc";
import {
  getAllCommunityInfo,
  getBatches,
  getCommunityInfo,
  getCourseById,
  getCourses,
  getDb,
  getEventById,
  getEvents,
  getTeamMembers,
} from "./db";

async function requireDb() {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
  return db;
}

// Empty form fields arrive as "" — store them as NULL.
const optText = z
  .string()
  .trim()
  .optional()
  .nullable()
  .transform(v => (v ? v : null));
const reqText = z.string().trim().min(1, "Required");
const flag = z.union([z.literal(0), z.literal(1)]).default(0);
const id = z.object({ id: z.number().int().positive() });

const courseInput = z.object({
  titleEn: reqText,
  titleAr: reqText,
  descriptionEn: optText,
  descriptionAr: optText,
  duration: optText,
  certification: optText,
  level: z.enum(["beginner", "intermediate", "advanced"]).default("beginner"),
  featured: flag,
});

const eventInput = z.object({
  titleEn: reqText,
  titleAr: reqText,
  descriptionEn: optText,
  descriptionAr: optText,
  eventDate: z.coerce.date(),
  eventTime: optText,
  topic: optText,
  speaker: optText,
  location: optText,
  featured: flag,
});

const batchInput = z.object({
  nameEn: reqText,
  nameAr: reqText,
  descriptionEn: optText,
  descriptionAr: optText,
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional().nullable(),
  enrollmentStatus: z.enum(["open", "closed", "full"]).default("open"),
  capacity: z.number().int().nonnegative().optional().nullable(),
  enrolled: z.number().int().nonnegative().default(0),
});

const teamInput = z.object({
  nameEn: reqText,
  nameAr: reqText,
  bioEn: optText,
  bioAr: optText,
  credentials: optText,
  photoUrl: z
    .string()
    .trim()
    .url("Must be a full https:// link")
    .optional()
    .nullable()
    .or(z.literal("").transform(() => null)),
  role: z.enum(["founder", "admin", "mentor"]).default("mentor"),
  order: z.number().int().default(0),
});

const communityInput = z.object({
  key: z.enum(["mission", "vision", "modeling_field"]),
  titleEn: optText,
  titleAr: optText,
  contentEn: optText,
  contentAr: optText,
});

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  admin: router({
    // Courses
    createCourse: adminProcedure.input(courseInput).mutation(async ({ input }) => {
      await (await requireDb()).insert(courses).values(input);
      return { success: true } as const;
    }),
    updateCourse: adminProcedure.input(courseInput.extend(id.shape)).mutation(async ({ input }) => {
      const { id: rowId, ...data } = input;
      await (await requireDb()).update(courses).set(data).where(eq(courses.id, rowId));
      return { success: true } as const;
    }),
    deleteCourse: adminProcedure.input(id).mutation(async ({ input }) => {
      await (await requireDb()).update(courses).set({ deletedAt: new Date() }).where(eq(courses.id, input.id));
      return { success: true } as const;
    }),

    // Events
    createEvent: adminProcedure.input(eventInput).mutation(async ({ input }) => {
      await (await requireDb()).insert(events).values(input);
      return { success: true } as const;
    }),
    updateEvent: adminProcedure.input(eventInput.extend(id.shape)).mutation(async ({ input }) => {
      const { id: rowId, ...data } = input;
      await (await requireDb()).update(events).set(data).where(eq(events.id, rowId));
      return { success: true } as const;
    }),
    deleteEvent: adminProcedure.input(id).mutation(async ({ input }) => {
      await (await requireDb()).update(events).set({ deletedAt: new Date() }).where(eq(events.id, input.id));
      return { success: true } as const;
    }),

    // Batches
    createBatch: adminProcedure.input(batchInput).mutation(async ({ input }) => {
      await (await requireDb()).insert(batches).values(input);
      return { success: true } as const;
    }),
    updateBatch: adminProcedure.input(batchInput.extend(id.shape)).mutation(async ({ input }) => {
      const { id: rowId, ...data } = input;
      await (await requireDb()).update(batches).set(data).where(eq(batches.id, rowId));
      return { success: true } as const;
    }),
    deleteBatch: adminProcedure.input(id).mutation(async ({ input }) => {
      await (await requireDb()).update(batches).set({ deletedAt: new Date() }).where(eq(batches.id, input.id));
      return { success: true } as const;
    }),

    // Team members
    createTeamMember: adminProcedure.input(teamInput).mutation(async ({ input }) => {
      await (await requireDb()).insert(teamMembers).values(input);
      return { success: true } as const;
    }),
    updateTeamMember: adminProcedure.input(teamInput.extend(id.shape)).mutation(async ({ input }) => {
      const { id: rowId, ...data } = input;
      await (await requireDb()).update(teamMembers).set(data).where(eq(teamMembers.id, rowId));
      return { success: true } as const;
    }),
    deleteTeamMember: adminProcedure.input(id).mutation(async ({ input }) => {
      await (await requireDb())
        .update(teamMembers)
        .set({ deletedAt: new Date() })
        .where(eq(teamMembers.id, input.id));
      return { success: true } as const;
    }),

    // Mission / Vision / Modelling field text (one row per key)
    listCommunityInfo: adminProcedure.query(() => getAllCommunityInfo()),
    saveCommunityInfo: adminProcedure.input(communityInput).mutation(async ({ input }) => {
      const { key, ...data } = input;
      await (await requireDb())
        .insert(communityInfo)
        .values(input)
        .onDuplicateKeyUpdate({ set: data });
      return { success: true } as const;
    }),
  }),

  content: router({
    getFeaturedCourses: publicProcedure.query(() => getCourses(true)),
    getAllCourses: publicProcedure.query(() => getCourses()),
    getCourseById: publicProcedure.input(id).query(({ input }) => getCourseById(input.id)),
    getFeaturedEvents: publicProcedure.query(() => getEvents(true)),
    getAllEvents: publicProcedure.query(() => getEvents()),
    getEventById: publicProcedure.input(id).query(({ input }) => getEventById(input.id)),
    getBatches: publicProcedure.query(() => getBatches()),
    getTeamMembers: publicProcedure.query(() => getTeamMembers()),
    getCommunityInfo: publicProcedure
      .input(z.object({ key: z.string() }))
      .query(async ({ input }) => (await getCommunityInfo(input.key)) ?? null),
  }),
});

export type AppRouter = typeof appRouter;
