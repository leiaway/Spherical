import { describe, it, beforeEach, expect, vi } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { PlaylistManager } from "./PlaylistManager";

const mockDeletePlaylist = { mutate: vi.fn() };
const mockCreatePlaylist = { mutateAsync: vi.fn(), isPending: false };
const mockUpdatePlaylist = { mutateAsync: vi.fn(), isPending: false };

vi.mock("@/hooks/usePlaylists", () => ({
  usePlaylists: () => ({
    playlists: [
      {
        id: "playlist-1",
        user_id: "user-1",
        name: "My Playlist",
        description: "Desc",
        region_id: null,
        is_public: false,
        created_at: "",
        updated_at: "",
        track_count: 3,
      },
    ],
    sharedPlaylists: [],
    isLoading: false,
    deletePlaylist: mockDeletePlaylist,
    currentUserId: "user-1",
    createPlaylist: mockCreatePlaylist,
    updatePlaylist: mockUpdatePlaylist,
  }),
  usePlaylistTracks: () => ({ data: [] }),
}));

vi.mock("@/components/ui/dropdown-menu", () => ({
  DropdownMenu: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DropdownMenuTrigger: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DropdownMenuContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DropdownMenuItem: (props: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button type="button" {...props} />
  ),
}));

vi.mock("./SharePlaylistDialog", () => ({
  SharePlaylistDialog: ({ playlist }: { playlist: { name: string } }) => (
    <button aria-label={`share-${playlist.name}`}>Share</button>
  ),
}));

describe("PlaylistManager", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows playlists and triggers delete on menu click", async () => {
    render(<PlaylistManager />);

    fireEvent.click(screen.getByRole("button", { name: /more actions/i }));
    fireEvent.click(screen.getByText(/delete/i));

    await waitFor(() => {
      expect(mockDeletePlaylist.mutate).toHaveBeenCalledWith("playlist-1");
    });
  });
});

