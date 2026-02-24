import { describe, it, vi, beforeEach, expect } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Auth from "./Auth";

const mockSignInWithPassword = vi.fn();
const mockSignUp = vi.fn();
const mockSignInWithOAuth = vi.fn();
const mockToast = vi.fn();
const mockNavigate = vi.fn();

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      signInWithPassword: (...args: unknown[]) => mockSignInWithPassword(...args),
      signUp: (...args: unknown[]) => mockSignUp(...args),
      signInWithOAuth: (...args: unknown[]) => mockSignInWithOAuth(...args),
    },
  },
}));

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: mockToast }),
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("Auth page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("E1: successful email login redirects home and shows toast", async () => {
    mockSignInWithPassword.mockResolvedValueOnce({ data: {}, error: null });
    const user = userEvent.setup();

    render(<Auth />);

    await user.type(screen.getByLabelText(/email/i), "user@example.com");
    await user.type(screen.getByLabelText(/password/i), "password123");

    await user.click(screen.getByRole("button", { name: "Sign In" }));

    await waitFor(() => {
      expect(mockSignInWithPassword).toHaveBeenCalledWith({
        email: "user@example.com",
        password: "password123",
      });
    });

    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Welcome back!",
        description: "Successfully logged in",
      }),
    );
    expect(mockNavigate).toHaveBeenCalledWith("/");
  });

  it("E2: missing email shows error and does not call Supabase", async () => {
    const user = userEvent.setup();

    render(<Auth />);

    await user.type(screen.getByLabelText(/password/i), "password123");
    await user.click(screen.getByRole("button", { name: "Sign In" }));

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Error",
          description: "Please enter an email address",
        }),
      );
    });

    expect(mockSignInWithPassword).not.toHaveBeenCalled();
  });

  it("P2: missing phone shows error and does not call Supabase", async () => {
    const user = userEvent.setup();

    render(<Auth />);

    await user.click(screen.getByRole("button", { name: /phone/i }));

    await user.type(screen.getByLabelText(/password/i), "password123");
    await user.click(screen.getByRole("button", { name: "Sign In" }));

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Error",
          description: "Please enter a phone number",
        }),
      );
    });

    expect(mockSignInWithPassword).not.toHaveBeenCalled();
  });

  it("E4: successful email sign-up redirects home and shows toast", async () => {
    mockSignUp.mockResolvedValueOnce({ data: {}, error: null });
    const user = userEvent.setup();

    render(<Auth />);

    await user.click(screen.getByRole("button", { name: /sign up/i }));

    await user.type(screen.getByLabelText(/email/i), "newuser@example.com");
    await user.type(screen.getByLabelText(/password/i), "password123");

    await user.click(screen.getByRole("button", { name: "Sign Up" }));

    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledWith({
        email: "newuser@example.com",
        password: "password123",
        options: expect.objectContaining({
          emailRedirectTo: expect.stringContaining("/"),
        }),
      });
    });

    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Account created!",
        description: "Welcome to FREQUENCY",
      }),
    );
    expect(mockNavigate).toHaveBeenCalledWith("/");
  });

  it("P1: successful phone login redirects home and shows toast", async () => {
    mockSignInWithPassword.mockResolvedValueOnce({ data: {}, error: null });
    const user = userEvent.setup();

    render(<Auth />);

    await user.click(screen.getByRole("button", { name: /phone/i }));

    await user.type(screen.getByLabelText(/phone number/i), "+1234567890");
    await user.type(screen.getByLabelText(/password/i), "password123");

    await user.click(screen.getByRole("button", { name: "Sign In" }));

    await waitFor(() => {
      expect(mockSignInWithPassword).toHaveBeenCalledWith({
        phone: "+1234567890",
        password: "password123",
      });
    });

    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Welcome back!",
        description: "Successfully logged in",
      }),
    );
    expect(mockNavigate).toHaveBeenCalledWith("/");
  });

  it("E3: email login error shows error toast and does not navigate", async () => {
    mockSignInWithPassword.mockResolvedValueOnce({
      data: null,
      error: { message: "Invalid login credentials" },
    });
    const user = userEvent.setup();

    render(<Auth />);

    await user.type(screen.getByLabelText(/email/i), "user@example.com");
    await user.type(screen.getByLabelText(/password/i), "wrong-password");

    await user.click(screen.getByRole("button", { name: "Sign In" }));

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Error",
          description: "Invalid login credentials",
        }),
      );
    });

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("E5: email sign-up error shows error toast and does not navigate", async () => {
    mockSignUp.mockResolvedValueOnce({
      data: null,
      error: { message: "Sign-up blocked: rate limited" },
    });
    const user = userEvent.setup();

    render(<Auth />);

    await user.click(screen.getByRole("button", { name: /sign up/i }));

    await user.type(screen.getByLabelText(/email/i), "newuser@example.com");
    await user.type(screen.getByLabelText(/password/i), "password123");

    await user.click(screen.getByRole("button", { name: "Sign Up" }));

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Error",
          description: "Sign-up blocked: rate limited",
        }),
      );
    });

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("P3: phone login error shows error toast and does not navigate", async () => {
    mockSignInWithPassword.mockResolvedValueOnce({
      data: null,
      error: { message: "Too many attempts" },
    });
    const user = userEvent.setup();

    render(<Auth />);

    await user.click(screen.getByRole("button", { name: /phone/i }));

    await user.type(screen.getByLabelText(/phone number/i), "+1234567890");
    await user.type(screen.getByLabelText(/password/i), "password123");

    await user.click(screen.getByRole("button", { name: "Sign In" }));

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Error",
          description: "Too many attempts",
        }),
      );
    });

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("G1: Google sign-in calls OAuth with correct options", async () => {
    mockSignInWithOAuth.mockResolvedValueOnce({ data: {}, error: null });
    const user = userEvent.setup();

    render(<Auth />);

    await user.click(screen.getByRole("button", { name: /sign in with google/i }));

    await waitFor(() => {
      expect(mockSignInWithOAuth).toHaveBeenCalledWith({
        provider: "google",
        options: expect.objectContaining({
          redirectTo: expect.stringContaining("/"),
        }),
      });
    });
  });
});
