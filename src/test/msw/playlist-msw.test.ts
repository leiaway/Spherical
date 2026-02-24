import { describe, it, expect } from "vitest";

describe("MSW playlist creation endpoint", () => {
  it("creates a playlist when name is provided", async () => {
    const res = await fetch("/test/playlists", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "My Regional Discoveries",
        description: "Test playlist",
        regionId: "region-1",
        isPublic: true,
      }),
    });

    expect(res.status).toBe(201);
    const json = (await res.json()) as {
      id: string;
      name: string;
      description?: string;
      regionId?: string;
      isPublic?: boolean;
    };

    expect(json.id).toBe("playlist-1");
    expect(json.name).toBe("My Regional Discoveries");
    expect(json.regionId).toBe("region-1");
    expect(json.isPublic).toBe(true);
  });

  it("returns 400 when name is missing", async () => {
    const res = await fetch("/test/playlists", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "" }),
    });

    expect(res.status).toBe(400);
    const json = (await res.json()) as { message: string };
    expect(json.message).toBe("Name is required");
  });
});

