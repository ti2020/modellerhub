import { eq, isNull } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, courses, events, batches, teamMembers, communityInfo } from "../drizzle/schema";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Courses queries
export async function getCourses(featured?: boolean) {
  const db = await getDb();
  if (!db) return [];
  const query = db.select().from(courses).where(isNull(courses.deletedAt));
  if (featured) {
    return await db.select().from(courses).where(isNull(courses.deletedAt));
  }
  return await query;
}

export async function getCourseById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(courses).where(eq(courses.id, id)).limit(1);
  return result[0];
}

// Events queries
export async function getEvents(featured?: boolean) {
  const db = await getDb();
  if (!db) return [];
  const query = db.select().from(events).where(isNull(events.deletedAt));
  if (featured) {
    return await db.select().from(events).where(isNull(events.deletedAt));
  }
  return await query;
}

export async function getEventById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(events).where(eq(events.id, id)).limit(1);
  return result[0];
}

// Batches queries
export async function getBatches() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(batches).where(isNull(batches.deletedAt));
}

export async function getBatchById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(batches).where(eq(batches.id, id)).limit(1);
  return result[0];
}

// Team members queries
export async function getTeamMembers() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(teamMembers).where(isNull(teamMembers.deletedAt)).orderBy(teamMembers.order);
}

export async function getTeamMemberById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(teamMembers).where(eq(teamMembers.id, id)).limit(1);
  return result[0];
}

// Community info queries
export async function getCommunityInfo(key: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(communityInfo).where(eq(communityInfo.key, key)).limit(1);
  return result[0];
}

export async function getAllCommunityInfo() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(communityInfo);
}
