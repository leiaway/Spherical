import { describe, it, beforeEach, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CreatePlaylistDialog } from "./CreatePlaylistDialog";

const mockMutateAsync = vi.fn();

// Make the dialog render inline in tests (no portals/focus-lock),
// so the form is always interactable in jsdom.
vi.mock("@/components/ui/dialog", () => ({
  Dialog: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogTrigger: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogTitle: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/hooks/usePlaylists", () => ({
  usePlaylists: () => ({
    createPlaylist: {
      mutateAsync: mockMutateAsync,
      isPending: false,
    },
    currentUserId: "user-1",
  }),
}));

describe("CreatePlaylistDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a playlist linked to the current region", async () => {
    const user = userEvent.setup();

    render(<CreatePlaylistDialog regionId="region-1" regionName="West Africa" />);

    await user.click(screen.getByRole("button", { name: /new playlist/i }));

    await user.type(screen.getByLabelText(/playlist name/i), "My Regional Discoveries");
    await user.type(screen.getByLabelText(/description/i), "A mix of tracks from West Africa");

    await user.click(screen.getByRole("button", { name: /create playlist/i }));

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        name: "My Regional Discoveries",
        description: "A mix of tracks from West Africa",
        regionId: "region-1",
        isPublic: false,
      });
    });
  });

  it("does not submit when name is empty", async () => {
    const user = userEvent.setup();

    render(<CreatePlaylistDialog regionId="region-1" regionName="West Africa" />);

    await user.click(screen.getByRole("button", { name: /new playlist/i }));

    await user.click(screen.getByRole("button", { name: /create playlist/i }));

    await waitFor(() => {
      expect(mockMutateAsync).not.toHaveBeenCalled();
    });
  });
});

