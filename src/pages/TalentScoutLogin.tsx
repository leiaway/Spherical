import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { isTalentScout } from "@/lib/auth";
import {
  authSignInPasswordSchema,
  revokeAllSessionsAfterFailedScoutPortalGate,
  SCOUT_PORTAL_SIGN_IN_GENERIC_DESCRIPTION,
  SCOUT_PORTAL_SIGN_IN_GENERIC_TITLE,
  signInWithEmailPassword,
} from "@/lib/authShared";
import { useUserRole } from "@/hooks/useUserRole";
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
import { Search, ArrowRight, Loader2 } from "lucide-react";

// Phase 1: Same password length rule as main Auth; generic errors below avoid role/account probing.
const talentScoutLoginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: authSignInPasswordSchema,
});

type TalentScoutLoginFormValues = z.infer<typeof talentScoutLoginSchema>;

const TalentScoutLogin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { session, isTalentScout: isScout, isLoading: roleLoading } = useUserRole();

  useEffect(() => {
    if (roleLoading) return;
    if (session && isScout) {
      navigate("/talent-scout", { replace: true });
    }
  }, [session, isScout, roleLoading, navigate]);

  const form = useForm<TalentScoutLoginFormValues>({
    resolver: zodResolver(talentScoutLoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleAuth = async (values: TalentScoutLoginFormValues) => {
    setIsLoading(true);
    try {
      const { error } = await signInWithEmailPassword(values.email, values.password);
      if (error) throw error;

      const allowed = await isTalentScout();
      if (!allowed) {
        // Phase 3: Global sign-out revokes refresh tokens so the mistaken session cannot call APIs for long.
        await revokeAllSessionsAfterFailedScoutPortalGate();
        // Phase 1: Same copy as invalid-credentials path — do not reveal "valid user but not a scout".
        toast({
          title: SCOUT_PORTAL_SIGN_IN_GENERIC_TITLE,
          description: SCOUT_PORTAL_SIGN_IN_GENERIC_DESCRIPTION,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Welcome back",
        description: "You're signed in to the Talent Scout portal.",
      });
      navigate("/talent-scout");
    } catch {
      // Phase 1: Do not surface Supabase error text (e.g. distinct messages for unconfirmed email vs bad password).
      toast({
        title: SCOUT_PORTAL_SIGN_IN_GENERIC_TITLE,
        description: SCOUT_PORTAL_SIGN_IN_GENERIC_DESCRIPTION,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (roleLoading || (session && isScout)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-background via-card/30 to-background">
      {/* Decorative gradient orbs for scout portal feel */}
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
            Talent Scout
          </h1>
          <p className="text-muted-foreground text-sm">
            Sign in to access the scout dashboard and manage your talent pipeline.
          </p>
        </div>

        <div className="bg-card/60 backdrop-blur-md p-8 rounded-2xl border border-border shadow-xl space-y-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleAuth)} className="space-y-5">
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
                        disabled={isLoading}
                        className="h-11"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>Password</FormLabel>
                      <Link
                        to="/talent-scout/forgot-password"
                        className="text-xs text-primary hover:underline font-medium"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        autoComplete="current-password"
                        disabled={isLoading}
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
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Signing in…
                  </>
                ) : (
                  <>
                    Sign in
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </form>
          </Form>

          <p className="text-center text-xs text-muted-foreground">
            {/* Phase 1: Avoid copy that helps infer account type; main app link stays neutral. */}
            <p className="text-muted-foreground text-sm">
            These aren't the tunes you're looking for?
          </p>
            <Link to="/auth" className="text-primary hover:underline font-medium">
              Sign in to FREQUENCY instead
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          <Link to="/" className="hover:underline">
            ← Back to home
          </Link>
        </p>
      </div>
    </div>
  );
};

export default TalentScoutLogin;
