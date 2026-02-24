import { describe, it, expect } from "vitest";

describe("MSW auth login endpoint", () => {
  it("returns user data for valid credentials", async () => {
    const res = await fetch("/test/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "user@example.com", password: "password123" }),
    });

    expect(res.status).toBe(200);
    const json = (await res.json()) as { userId: string; token: string };
    expect(json.userId).toBe("user-1");
    expect(json.token).toBe("test-token");
  });

  it("returns 401 for invalid credentials", async () => {
    const res = await fetch("/test/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "wrong@example.com", password: "nope" }),
    });

    expect(res.status).toBe(401);
    const json = (await res.json()) as { message: string };
    expect(json.message).toBe("Invalid login credentials");
  });
});

