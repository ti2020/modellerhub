import { beforeAll, describe, expect, it } from "vitest";

beforeAll(() => {
  process.env.JWT_SECRET = "test-secret-that-is-at-least-32-characters-long";
  process.env.ADMIN_EMAILS = "Admin@Example.com, second@example.com";
});

describe("session tokens", () => {
  it("round-trips a signed session", async () => {
    const { createSessionToken, verifySessionToken } = await import("./_core/session");
    const token = await createSessionToken({ openId: "google:123", email: "admin@example.com" });
    expect(await verifySessionToken(token)).toEqual({ openId: "google:123", email: "admin@example.com" });
  });

  it("rejects a tampered token", async () => {
    const { createSessionToken, verifySessionToken } = await import("./_core/session");
    const token = await createSessionToken({ openId: "google:123", email: "admin@example.com" });
    expect(await verifySessionToken(token.slice(0, -2) + "xx")).toBeNull();
    expect(await verifySessionToken(undefined)).toBeNull();
  });
});

describe("admin allowlist", () => {
  it("matches emails case-insensitively and ignores spaces", async () => {
    const { isAdminEmail } = await import("./_core/env");
    expect(isAdminEmail("admin@example.com")).toBe(true);
    expect(isAdminEmail(" SECOND@example.com ")).toBe(true);
    expect(isAdminEmail("someone@else.com")).toBe(false);
    expect(isAdminEmail(null)).toBe(false);
  });
});
