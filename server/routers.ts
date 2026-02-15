import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { getCourses, getCourseById, getEvents, getEventById, getBatches, getTeamMembers, getCommunityInfo, getDb } from "./db";
import { z } from "zod";
import { courses, events, batches, teamMembers, communityInfo, type InsertCourse } from "../drizzle/schema";
import { eq } from "drizzle-orm";

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
    createCourse: protectedProcedure
      .input(z.object({
        titleEn: z.string(),
        titleAr: z.string(),
        descriptionEn: z.string().optional(),
        descriptionAr: z.string().optional(),
        duration: z.string().optional(),
        certification: z.string().optional(),
        level: z.enum(["beginner", "intermediate", "advanced"]).default("beginner"),
        featured: z.number().default(0),
      }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user?.role !== "admin") throw new Error("Unauthorized");
        const db = await getDb();
        if (!db) throw new Error("Database unavailable");
        await db.insert(courses).values(input as InsertCourse);
        return { success: true };
      }),
    updateCourse: protectedProcedure
      .input(z.object({
        id: z.number(),
        titleEn: z.string().optional(),
        titleAr: z.string().optional(),
        descriptionEn: z.string().optional(),
        descriptionAr: z.string().optional(),
        duration: z.string().optional(),
        certification: z.string().optional(),
        level: z.enum(["beginner", "intermediate", "advanced"]).optional(),
        featured: z.number().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user?.role !== "admin") throw new Error("Unauthorized");
        const db = await getDb();
        if (!db) throw new Error("Database unavailable");
        const { id, ...data } = input;
        await db.update(courses).set(data).where(eq(courses.id, id));
        return { success: true };
      }),
    deleteCourse: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user?.role !== "admin") throw new Error("Unauthorized");
        const db = await getDb();
        if (!db) throw new Error("Database unavailable");
        await db.update(courses).set({ deletedAt: new Date() as any }).where(eq(courses.id, input.id));
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
