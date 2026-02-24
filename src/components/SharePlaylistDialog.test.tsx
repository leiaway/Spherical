import { describe, it, beforeEach, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SharePlaylistDialog } from "./SharePlaylistDialog";

const mockShareMutateAsync = vi.fn();

vi.mock("@/hooks/useFriends", () => ({
  useFriends: () => ({
    friends: [
      {
        id: "friendship-1",
        user_id: "user-1",
        friend_id: "friend-1",
        user_profile: null,
        friend_profile: {
          id: "friend-1",
          display_name: "Alice",
          avatar_url: null,
        },
      },
    ],
  }),
}));

vi.mock("@/hooks/usePlaylists", () => ({
  usePlaylists: () => ({
    sharePlaylist: {
      mutateAsync: mockShareMutateAsync,
      isPending: false,
    },
    currentUserId: "user-1",
  }),
  usePlaylistShares: () => ({ data: [] }),
}));

describe("SharePlaylistDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shares playlist with a friend when Share is clicked", async () => {
    const user = userEvent.setup();

    render(
      <SharePlaylistDialog
        playlist={{
          id: "playlist-1",
          user_id: "user-1",
          name: "My Playlist",
          description: null,
          region_id: null,
          is_public: false,
          created_at: "",
          updated_at: "",
        }}
      />,
    );

    await user.click(screen.getByRole("button", { name: /share/i }));

    await user.click(screen.getByRole("button", { name: /^share$/i }));

    await waitFor(() => {
      expect(mockShareMutateAsync).toHaveBeenCalledWith({
        playlistId: "playlist-1",
        userId: "friend-1",
      });
    });
  });
});

