import { describe, it, expect } from "vitest";

describe("MSW friend request endpoint", () => {
  it("creates a friend request when fromUserId and toUserId are provided", async () => {
    const res = await fetch("/test/friends/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fromUserId: "user-1", toUserId: "friend-1" }),
    });

    expect(res.status).toBe(201);
    const json = (await res.json()) as {
      id: string;
      fromUserId: string;
      toUserId: string;
    };

    expect(json.id).toBe("req-1");
    expect(json.fromUserId).toBe("user-1");
    expect(json.toUserId).toBe("friend-1");
  });

  it("returns 400 when user ids are missing", async () => {
    const res = await fetch("/test/friends/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fromUserId: "user-1" }),
    });

    expect(res.status).toBe(400);
    const json = (await res.json()) as { message: string };
    expect(json.message).toBe("Missing fromUserId or toUserId");
  });
});

