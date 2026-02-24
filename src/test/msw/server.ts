import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";

// Shared test-only handlers. Individual tests can
// override these with server.use(...) as needed.
export const handlers = [
  // Auth login simulation
  http.post("/test/auth/login", async ({ request }) => {
    const body = (await request.json()) as { email?: string; password?: string };

    if (body.email === "user@example.com" && body.password === "password123") {
      return HttpResponse.json({ userId: "user-1", token: "test-token" });
    }

    return HttpResponse.json(
      { message: "Invalid login credentials" },
      { status: 401 },
    );
  }),

  // Playlist creation simulation
  http.post("/test/playlists", async ({ request }) => {
    const body = (await request.json()) as {
      name: string;
      description?: string;
      regionId?: string;
      isPublic?: boolean;
    };

    if (!body.name?.trim()) {
      return HttpResponse.json(
        { message: "Name is required" },
        { status: 400 },
      );
    }

    return HttpResponse.json(
      {
        id: "playlist-1",
        ...body,
      },
      { status: 201 },
    );
  }),

  // Friend request simulation
  http.post("/test/friends/request", async ({ request }) => {
    const body = (await request.json()) as { fromUserId?: string; toUserId?: string };

    if (!body.fromUserId || !body.toUserId) {
      return HttpResponse.json(
        { message: "Missing fromUserId or toUserId" },
        { status: 400 },
      );
    }

    return HttpResponse.json(
      {
        id: "req-1",
        fromUserId: body.fromUserId,
        toUserId: body.toUserId,
      },
      { status: 201 },
    );
  }),
];

export const server = setupServer(...handlers);

