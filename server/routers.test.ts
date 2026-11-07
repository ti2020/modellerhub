import { describe, expect, it } from "vitest";
import type { TrpcContext } from "./_core/context";
import { appRouter } from "./routers";

function ctxFor(role: "admin" | "user" | null): TrpcContext {
  const user =
    role === null
      ? null
      : {
          id: 1,
          openId: `google:${role}`,
          email: `${role}@example.com`,
          name: role,
          loginMethod: "google",
          role,
          createdAt: new Date(),
          updatedAt: new Date(),
          lastSignedIn: new Date(),
        };
  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

const course = { titleEn: "Course", titleAr: "دورة" };

describe("admin procedures", () => {
  it("reject anonymous visitors", async () => {
    const caller = appRouter.createCaller(ctxFor(null));
    await expect(caller.admin.createCourse(course)).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("reject signed-in non-admins", async () => {
    const caller = appRouter.createCaller(ctxFor("user"));
    await expect(caller.admin.deleteCourse({ id: 1 })).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(caller.admin.listCommunityInfo()).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("validate input before touching the database", async () => {
    const caller = appRouter.createCaller(ctxFor("admin"));
    await expect(caller.admin.createCourse({ titleEn: "", titleAr: "x" })).rejects.toMatchObject({
      code: "BAD_REQUEST",
    });
    await expect(
      caller.admin.saveCommunityInfo({ key: "not-a-section" as "mission" })
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
});

describe("public content", () => {
  it("returns empty results instead of failing when no database is configured", async () => {
    const caller = appRouter.createCaller(ctxFor(null));
    expect(await caller.content.getAllCourses()).toEqual([]);
    expect(await caller.content.getCommunityInfo({ key: "mission" })).toBeNull();
  });

  it("auth.me returns the current user or null", async () => {
    expect(await appRouter.createCaller(ctxFor(null)).auth.me()).toBeNull();
    expect((await appRouter.createCaller(ctxFor("admin")).auth.me())?.role).toBe("admin");
  });
});
