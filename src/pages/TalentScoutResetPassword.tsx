import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuthSession } from "@/hooks/useAuthSession";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Search, Loader2, KeyRound } from "lucide-react";

// Strong password: min 8 chars, at least one upper, lower, number, and special character
const strongPasswordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must include at least one uppercase letter")
  .regex(/[a-z]/, "Password must include at least one lowercase letter")
  .regex(/[0-9]/, "Password must include at least one number")
  .regex(
    /[^A-Za-z0-9]/,
    "Password must include at least one special character (e.g. !@#$%)"
  );

const resetPasswordSchema = z
  .object({
    password: strongPasswordSchema,
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

function isRecoveryRedirect(): boolean {
  if (typeof window === "undefined") return false;
  const hash = window.location.hash;
  if (!hash) return false;
  const params = new URLSearchParams(hash.replace(/^#/, ""));
  return params.get("type") === "recovery";
}

const TalentScoutResetPassword = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: session, isPending: sessionPending } = useAuthSession();

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const isRecovery = isRecoveryRedirect();
  const recoveryValid = isRecovery && session;

  const handleSubmit = async (values: ResetPasswordFormValues) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: values.password,
      });
      if (error) throw error;
      toast({
        title: "Password updated",
        description: "Sign in with your new password.",
      });
      await supabase.auth.signOut();
      navigate("/talent-scout/login", { replace: true });
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Could not update password. The link may have expired.";
      toast({
        title: "Update failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isRecovery && sessionPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading…</p>
      </div>
    );
  }

  if (!isRecovery || !recoveryValid) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-background via-card/30 to-background">
        <div className="relative w-full max-w-md space-y-8">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-destructive/15 text-destructive mb-2">
              <KeyRound className="w-7 h-7" aria-hidden />
            </div>
            <h1 className="text-2xl font-bold text-foreground">
              Invalid or expired link
            </h1>
            <p className="text-muted-foreground text-sm">
              This password reset link is invalid or has expired. Request a new one from the sign-in page.
            </p>
          </div>
          <div className="bg-card/60 backdrop-blur-md p-8 rounded-2xl border border-border text-center space-y-4">
            <Button asChild className="w-full">
              <Link to="/talent-scout/forgot-password">Request new reset link</Link>
            </Button>
            <p className="text-sm">
              <Link to="/talent-scout/login" className="text-primary hover:underline">
                ← Back to sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-background via-card/30 to-background">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-secondary/10 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md space-y-8">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-primary/15 text-primary mb-2">
            <Search className="w-7 h-7" aria-hidden />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Set new password
          </h1>
          <p className="text-muted-foreground text-sm">
            Choose a strong password. You’ll sign in with it after this.
          </p>
        </div>

        <div className="bg-card/60 backdrop-blur-md p-8 rounded-2xl border border-border shadow-xl space-y-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        autoComplete="new-password"
                        disabled={isLoading}
                        className="h-11 font-mono"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                    <p className="text-xs text-muted-foreground mt-1">
                      At least 8 characters with uppercase, lowercase, number, and special character.
                    </p>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm new password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        autoComplete="new-password"
                        disabled={isLoading}
                        className="h-11 font-mono"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full h-11 font-medium gap-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Updating…
                  </>
                ) : (
                  "Update password"
                )}
              </Button>
            </form>
          </Form>

          <p className="text-center text-xs text-muted-foreground">
            <Link to="/talent-scout/login" className="hover:underline">
              ← Back to sign in
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          <Link to="/" className="hover:underline">← Back to home</Link>
        </p>
      </div>
    </div>
  );
};

export default TalentScoutResetPassword;
