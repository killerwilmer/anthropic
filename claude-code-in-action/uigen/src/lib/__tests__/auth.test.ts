// @vitest-environment node
import { test, expect, vi, beforeEach } from "vitest";
import { jwtVerify } from "jose";

vi.mock("server-only", () => ({}));

const mockCookieStore = {
  _store: new Map<string, string>(),
  get(name: string) {
    const value = this._store.get(name);
    return value !== undefined ? { name, value } : undefined;
  },
  set(name: string, value: string) {
    this._store.set(name, value);
  },
  delete(name: string) {
    this._store.delete(name);
  },
};

vi.mock("next/headers", () => ({
  cookies: () => Promise.resolve(mockCookieStore),
}));

const { createSession } = await import("@/lib/auth");

beforeEach(() => {
  mockCookieStore._store.clear();
});

test("createSession sets an auth-token cookie", async () => {
  await createSession("user-1", "test@example.com");
  expect(mockCookieStore._store.has("auth-token")).toBe(true);
});

test("createSession stores a valid JWT (three dot-separated segments)", async () => {
  await createSession("user-1", "test@example.com");
  const token = mockCookieStore._store.get("auth-token");
  expect(typeof token).toBe("string");
  expect(token!.split(".")).toHaveLength(3);
});

test("createSession tokens for different users are distinct", async () => {
  await createSession("user-1", "alice@example.com");
  const token1 = mockCookieStore._store.get("auth-token");

  mockCookieStore._store.clear();

  await createSession("user-2", "bob@example.com");
  const token2 = mockCookieStore._store.get("auth-token");

  expect(token1).not.toBe(token2);
});

test("createSession encodes userId and email in the JWT payload", async () => {
  await createSession("user-99", "payload@example.com");
  const token = mockCookieStore._store.get("auth-token")!;

  const secret = new TextEncoder().encode(
    process.env.JWT_SECRET || "development-secret-key"
  );
  const { payload } = await jwtVerify(token, secret);

  expect(payload.userId).toBe("user-99");
  expect(payload.email).toBe("payload@example.com");
});
