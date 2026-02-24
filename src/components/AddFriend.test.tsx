import { describe, it, beforeEach, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AddFriend } from "./AddFriend";

const mockSendFriendRequest = vi.fn();

const chain = {
  select: vi.fn(),
  ilike: vi.fn(),
  neq: vi.fn(),
  limit: vi.fn(),
};

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn(() => chain),
  },
}));

vi.mock("@/hooks/useFriends", () => ({
  useFriends: () => ({
    currentUserId: "user-1",
    sendFriendRequest: mockSendFriendRequest,
  }),
}));

describe("AddFriend", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    chain.select.mockReturnValue(chain);
    chain.ilike.mockReturnValue(chain);
    chain.neq.mockReturnValue(chain);
    chain.limit.mockResolvedValue({
      data: [{ id: "friend-1", display_name: "Alice", avatar_url: null }],
      error: null,
    });

    mockSendFriendRequest.mockResolvedValue(true);
  });

  it("searches profiles and sends a friend request", async () => {
    const user = userEvent.setup();
    render(<AddFriend />);

    await user.type(screen.getByPlaceholderText(/search by name/i), "Ali");
    await user.click(screen.getByRole("button", { name: /search/i }));

    expect(await screen.findByText("Alice")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /add/i }));

    await waitFor(() => {
      expect(mockSendFriendRequest).toHaveBeenCalledWith("friend-1");
    });

    await waitFor(() => {
      expect(screen.queryByText("Alice")).not.toBeInTheDocument();
    });
  });
});

