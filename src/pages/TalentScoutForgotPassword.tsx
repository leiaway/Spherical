import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
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
import { Search, ArrowRight, Loader2, Mail } from "lucide-react";

const RESET_COOLDOWN_SECONDS = 60;

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

const TalentScoutForgotPassword = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const { toast } = useToast();

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  // Cooldown timer so user can't spam reset emails
  const startCooldown = () => {
    setCooldownRemaining(RESET_COOLDOWN_SECONDS);
    const interval = setInterval(() => {
      setCooldownRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSubmit = async (values: ForgotPasswordFormValues) => {
    setIsLoading(true);
    try {
      const redirectTo = `${window.location.origin}/talent-scout/reset-password`;
      await supabase.auth.resetPasswordForEmail(values.email, {
        redirectTo,
      });
      // Always show the same message to avoid revealing whether the email exists (no user enumeration)
      setResetSent(true);
      startCooldown();
      toast({
        title: "Check your email",
        description:
          "If an account exists for this email, you’ll receive a password reset link. Check your inbox and spam folder.",
      });
    } catch {
      // Don't surface API errors that could leak account existence; show generic message
      setResetSent(true);
      startCooldown();
      toast({
        title: "Check your email",
        description:
          "If an account exists for this email, you’ll receive a password reset link. Check your inbox and spam folder.",
      });
    } finally {
      setIsLoading(false);
    }
  };

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
            Forgot password
          </h1>
          <p className="text-muted-foreground text-sm">
            Enter your Talent Scout account email. We’ll send you a secure link to reset your password.
          </p>
        </div>

        <div className="bg-card/60 backdrop-blur-md p-8 rounded-2xl border border-border shadow-xl space-y-6">
          {resetSent ? (
            <div className="space-y-4 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/15 text-primary">
                <Mail className="w-6 h-6" />
              </div>
              <p className="text-sm text-muted-foreground">
                If an account exists for that email, you’ll receive a password reset link shortly. Check your inbox and spam folder. The link expires in 1 hour.
              </p>
              {cooldownRemaining > 0 ? (
                <p className="text-xs text-muted-foreground">
                  You can request another link in <strong>{cooldownRemaining}</strong> seconds.
                </p>
              ) : (
                <button
                  type="button"
                  onClick={() => setResetSent(false)}
                  className="text-sm text-primary hover:underline font-medium"
                >
                  Use a different email
                </button>
              )}
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="scout@example.com"
                          autoComplete="email"
                          disabled={isLoading || cooldownRemaining > 0}
                          className="h-11"
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
                  disabled={isLoading || cooldownRemaining > 0}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Sending…
                    </>
                  ) : (
                    <>
                      Send reset link
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </form>
            </Form>
          )}

          <p className="text-center">
            <Link
              to="/talent-scout/login"
              className="text-sm text-primary hover:underline font-medium"
            >
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

export default TalentScoutForgotPassword;
