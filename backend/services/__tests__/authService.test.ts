import jwt from "jsonwebtoken";
const { generateOAuthUrl, verifyToken } = require("../authService");

// Mock supabase admin client
jest.mock("../supabaseService", () => {
  return {
    supabaseAdmin: {
      auth: {
        signInWithOAuth: jest.fn(({ provider, options }) => {
          if (provider !== "google") {
            return { data: null, error: new Error("unsupported provider") };
          }
          return {
            data: {
              url: `https://oauth.mock/${provider}?redirect_to=${encodeURIComponent(
                options.redirectTo
              )}`,
            },
            error: null,
          };
        }),
      },
    },
  };
});

describe("authService", () => {
  describe("generateOAuthUrl", () => {
    it("should return a valid url for google provider", async () => {
      const url = await generateOAuthUrl("google", "http://localhost/callback");
      expect(url).toContain("https://oauth.mock/google");
    });

    it("should throw if supabase returns error", async () => {
      const { supabaseAdmin } = require("../supabaseService");
      supabaseAdmin.auth.signInWithOAuth.mockResolvedValueOnce({
        data: null,
        error: new Error("fail"),
      });
      await expect(generateOAuthUrl("google", "http://x")).rejects.toThrow(
        "fail"
      );
    });
  });

  describe("verifyToken", () => {
    const secret = process.env.SUPABASE_JWT_SECRET;
    const payload = { sub: "user1", email: "a@b.com", role: "authenticated" };

    it("should decode valid token", async () => {
      console.log("[TEST] Secret used to sign:", secret);
      console.log("[TEST] Payload:", payload);
      const token = jwt.sign(payload, secret as string);
      console.log("[TEST] Generated token:", token);
      try {
        const decoded = await verifyToken(token);
        console.log("[TEST] Decoded result:", decoded);
        expect(decoded.userId).toBe(payload.sub);
        expect(decoded.email).toBe(payload.email);
        expect(decoded.roles).toContain("authenticated");
      } catch (err) {
        console.error("[TEST] Error thrown by verifyToken:", err);
        throw err;
      }
    });

    it("should throw on invalid token", async () => {
      await expect(verifyToken("bad-token")).rejects.toThrow();
    });
  });
});
