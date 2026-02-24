import { describe, it, beforeEach, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FriendsList } from "./FriendsList";

const mockAccept = vi.fn();
const mockReject = vi.fn();

vi.mock("@/hooks/useFriends", () => ({
  useFriends: () => ({
    friends: [],
    pendingRequests: [
      {
        id: "req-1",
        user_id: "friend-1",
        friend_id: "user-1",
        status: "pending",
        created_at: "",
        user_profile: {
          id: "friend-1",
          display_name: "Alice",
          avatar_url: null,
        },
      },
    ],
    loading: false,
    currentUserId: "user-1",
    acceptFriendRequest: mockAccept,
    rejectFriendRequest: mockReject,
    removeFriend: vi.fn(),
  }),
}));

describe("FriendsList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("accepts and rejects a pending friend request", async () => {
    const user = userEvent.setup();
    render(<FriendsList />);

    expect(screen.getByText(/pending requests/i)).toBeInTheDocument();
    expect(screen.getByText("Alice")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /accept friend request/i }));
    expect(mockAccept).toHaveBeenCalledWith("req-1");

    await user.click(screen.getByRole("button", { name: /reject friend request/i }));
    expect(mockReject).toHaveBeenCalledWith("req-1");
  });
});

