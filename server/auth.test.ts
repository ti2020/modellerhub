import { describe, expect, it } from "vitest";

describe("auth helpers", async () => {
  // Import after env is set, since ENV is read at module load.
  process.env.JWT_SECRET = "test-secret-that-is-at-least-32-characters";
  process.env.ADMIN_EMAILS = "Owner@Example.com, second@example.com";
  const auth = await import("./_core/auth");

  it("matches admin emails case-insensitively", () => {
    expect(auth.isAdminEmail("owner@example.com")).toBe(true);
    expect(auth.isAdminEmail(" SECOND@example.com ")).toBe(true);
    expect(auth.isAdminEmail("someone@example.com")).toBe(false);
    expect(auth.isAdminEmail(null)).toBe(false);
  });

  it("prefixes Google IDs", () => {
    expect(auth.googleOpenId("123")).toBe("google:123");
  });

  it("round-trips a session token and rejects tampered ones", async () => {
    const token = await auth.createSessionToken("google:123");
    expect(await auth.verifySessionToken(token)).toEqual({ openId: "google:123" });
    expect(await auth.verifySessionToken(token.slice(0, -2) + "xx")).toBeNull();
    expect(await auth.verifySessionToken(undefined)).toBeNull();
  });
});
