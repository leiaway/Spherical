import { describe, it, beforeEach, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EditPlaylistDialog } from "./EditPlaylistDialog";
import type { Playlist } from "@/hooks/usePlaylists";

const mockUpdatePlaylist = { mutateAsync: vi.fn(), isPending: false };

// Make the dialog + switch render simply in tests (no portals / focus-lock).
vi.mock("@/components/ui/dialog", () => ({
  Dialog: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogTrigger: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogTitle: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/components/ui/switch", () => ({
  Switch: ({
    checked,
    onCheckedChange,
    ...props
  }: {
    checked?: boolean;
    onCheckedChange?: (checked: boolean) => void;
  } & React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button
      type="button"
      role="switch"
      aria-checked={!!checked}
      onClick={() => onCheckedChange?.(!checked)}
      {...props}
    />
  ),
}));

const basePlaylist: Playlist = {
  id: "playlist-1",
  user_id: "user-1",
  name: "Old Name",
  description: "Old description",
  region_id: "region-1",
  is_public: false,
  created_at: "",
  updated_at: "",
};

vi.mock("@/hooks/usePlaylists", () => ({
  usePlaylists: () => ({
    updatePlaylist: mockUpdatePlaylist,
    currentUserId: "user-1",
  }),
}));

describe("EditPlaylistDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("updates playlist with new values when form is submitted", async () => {
    const user = userEvent.setup();

    render(<EditPlaylistDialog playlist={basePlaylist} />);

    await user.click(screen.getByRole("button", { name: /edit/i }));

    const nameInput = screen.getByLabelText(/playlist name/i) as HTMLInputElement;
    const descInput = screen.getByLabelText(/description/i) as HTMLTextAreaElement;

    await user.clear(nameInput);
    await user.type(nameInput, "New Name");

    await user.clear(descInput);
    await user.type(descInput, "New description");

    await user.click(screen.getByRole("switch", { name: /public playlist/i }));

    await user.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() => {
      expect(mockUpdatePlaylist.mutateAsync).toHaveBeenCalledWith({
        id: "playlist-1",
        name: "New Name",
        description: "New description",
        regionId: "region-1",
        isPublic: true,
      });
    });
  });

  it("does not submit when name is empty", async () => {
    const user = userEvent.setup();

    render(<EditPlaylistDialog playlist={basePlaylist} />);

    await user.click(screen.getByRole("button", { name: /edit/i }));

    const nameInput = screen.getByLabelText(/playlist name/i) as HTMLInputElement;

    await user.clear(nameInput);
    await user.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() => {
      expect(mockUpdatePlaylist.mutateAsync).not.toHaveBeenCalled();
    });
  });
});

