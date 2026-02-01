import { describe, test, expect, vi, beforeEach } from "vitest";

vi.mock("server-only", () => ({}));

const {
  mockSign,
  mockSetProtectedHeader,
  mockSetExpirationTime,
  mockSetIssuedAt,
  mockCookieSet,
  mockCookieGet,
  mockCookieDelete,
  mockJwtVerify,
} = vi.hoisted(() => ({
  mockSign: vi.fn().mockResolvedValue("mock-jwt-token"),
  mockSetProtectedHeader: vi.fn().mockReturnThis(),
  mockSetExpirationTime: vi.fn().mockReturnThis(),
  mockSetIssuedAt: vi.fn().mockReturnThis(),
  mockCookieSet: vi.fn(),
  mockCookieGet: vi.fn(),
  mockCookieDelete: vi.fn(),
  mockJwtVerify: vi.fn(),
}));

vi.mock("jose", () => ({
  SignJWT: vi.fn().mockImplementation(() => ({
    setProtectedHeader: mockSetProtectedHeader,
    setExpirationTime: mockSetExpirationTime,
    setIssuedAt: mockSetIssuedAt,
    sign: mockSign,
  })),
  jwtVerify: mockJwtVerify,
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn().mockResolvedValue({
    set: mockCookieSet,
    get: mockCookieGet,
    delete: mockCookieDelete,
  }),
}));

import { createSession, getSession, deleteSession, verifySession } from "../auth";

describe("createSession", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("creates JWT with userId and email in payload", async () => {
    const { SignJWT } = await import("jose");

    await createSession("user-123", "test@example.com");

    expect(SignJWT).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "user-123",
        email: "test@example.com",
      })
    );
  });

  test("configures JWT with HS256 algorithm", async () => {
    await createSession("user-123", "test@example.com");

    expect(mockSetProtectedHeader).toHaveBeenCalledWith({ alg: "HS256" });
  });

  test("sets JWT expiration to 7 days", async () => {
    await createSession("user-123", "test@example.com");

    expect(mockSetExpirationTime).toHaveBeenCalledWith("7d");
  });

  test("sets auth-token cookie with the signed JWT", async () => {
    await createSession("user-123", "test@example.com");

    expect(mockCookieSet).toHaveBeenCalledWith(
      "auth-token",
      "mock-jwt-token",
      expect.objectContaining({
        httpOnly: true,
        sameSite: "lax",
        path: "/",
      })
    );
  });

  test("calls setIssuedAt on the JWT", async () => {
    await createSession("user-123", "test@example.com");

    expect(mockSetIssuedAt).toHaveBeenCalled();
  });

  test("includes expiresAt date in JWT payload", async () => {
    const { SignJWT } = await import("jose");

    await createSession("user-123", "test@example.com");

    expect(SignJWT).toHaveBeenCalledWith(
      expect.objectContaining({
        expiresAt: expect.any(Date),
      })
    );
  });

  test("sets cookie expiration to 7 days from now", async () => {
    const now = new Date("2025-01-15T12:00:00Z");
    vi.setSystemTime(now);

    await createSession("user-123", "test@example.com");

    const expectedExpiry = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    expect(mockCookieSet).toHaveBeenCalledWith(
      "auth-token",
      "mock-jwt-token",
      expect.objectContaining({
        expires: expectedExpiry,
      })
    );

    vi.useRealTimers();
  });

  test("signs the JWT with the secret", async () => {
    await createSession("user-123", "test@example.com");

    expect(mockSign).toHaveBeenCalled();
  });
});

describe("getSession", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("returns null when no auth cookie exists", async () => {
    mockCookieGet.mockReturnValue(undefined);

    const session = await getSession();

    expect(session).toBeNull();
  });

  test("returns session payload when valid token exists", async () => {
    const mockPayload = {
      userId: "user-123",
      email: "test@example.com",
      expiresAt: new Date(),
    };
    mockCookieGet.mockReturnValue({ value: "valid-token" });
    mockJwtVerify.mockResolvedValue({ payload: mockPayload });

    const session = await getSession();

    expect(session).toEqual(mockPayload);
  });

  test("verifies token with jwtVerify", async () => {
    mockCookieGet.mockReturnValue({ value: "valid-token" });
    mockJwtVerify.mockResolvedValue({ payload: {} });

    await getSession();

    expect(mockJwtVerify).toHaveBeenCalled();
    expect(mockJwtVerify.mock.calls[0][0]).toBe("valid-token");
  });

  test("returns null when token verification fails", async () => {
    mockCookieGet.mockReturnValue({ value: "invalid-token" });
    mockJwtVerify.mockRejectedValue(new Error("Invalid token"));

    const session = await getSession();

    expect(session).toBeNull();
  });
});

describe("deleteSession", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("deletes the auth-token cookie", async () => {
    await deleteSession();

    expect(mockCookieDelete).toHaveBeenCalledWith("auth-token");
  });
});

describe("verifySession", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("returns null when request has no auth cookie", async () => {
    const mockRequest = {
      cookies: {
        get: vi.fn().mockReturnValue(undefined),
      },
    } as any;

    const session = await verifySession(mockRequest);

    expect(session).toBeNull();
  });

  test("returns session payload when request has valid token", async () => {
    const mockPayload = {
      userId: "user-123",
      email: "test@example.com",
      expiresAt: new Date(),
    };
    const mockRequest = {
      cookies: {
        get: vi.fn().mockReturnValue({ value: "valid-token" }),
      },
    } as any;
    mockJwtVerify.mockResolvedValue({ payload: mockPayload });

    const session = await verifySession(mockRequest);

    expect(session).toEqual(mockPayload);
  });

  test("returns null when token verification fails", async () => {
    const mockRequest = {
      cookies: {
        get: vi.fn().mockReturnValue({ value: "invalid-token" }),
      },
    } as any;
    mockJwtVerify.mockRejectedValue(new Error("Invalid token"));

    const session = await verifySession(mockRequest);

    expect(session).toBeNull();
  });
});
