import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

const authSchema = z.object({
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  phone: z.string().min(10, "Phone number must be at least 10 digits").optional().or(z.literal("")),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type AuthFormValues = z.infer<typeof authSchema>;

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [authMethod, setAuthMethod] = useState<"email" | "phone">("email");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const form = useForm<AuthFormValues>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      email: "",
      phone: "",
      password: "",
    },
  });

  const handleAuth = async (values: AuthFormValues) => {
    setIsLoading(true);
    try {
      if (authMethod === "email") {
        if (!values.email) {
          toast({
            title: "Error",
            description: "Please enter an email address",
            variant: "destructive",
          });
          return;
        }

        if (isLogin) {
          const { error } = await supabase.auth.signInWithPassword({
            email: values.email,
            password: values.password,
          });
          if (error) throw error;
          toast({
            title: "Welcome back!",
            description: "Successfully logged in",
          });
        } else {
          const { error } = await supabase.auth.signUp({
            email: values.email,
            password: values.password,
            options: {
              emailRedirectTo: `${window.location.origin}/`,
            },
          });
          if (error) throw error;
          toast({
            title: "Account created!",
            description: "Welcome to FREQUENCY",
          });
        }
      } else {
        if (!values.phone) {
          toast({
            title: "Error",
            description: "Please enter a phone number",
            variant: "destructive",
          });
          return;
        }

        if (isLogin) {
          const { error } = await supabase.auth.signInWithPassword({
            phone: values.phone,
            password: values.password,
          });
          if (error) throw error;
          toast({
            title: "Welcome back!",
            description: "Successfully logged in",
          });
        } else {
          const { error } = await supabase.auth.signUp({
            phone: values.phone,
            password: values.password,
          });
          if (error) throw error;
          toast({
            title: "Account created!",
            description: "Welcome to FREQUENCY",
          });
        }
      }
      navigate("/");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An error occurred during authentication",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });
      if (error) throw error;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to sign in with Google",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-card to-background">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-wider text-primary">FREQUENCY</h1>
          <p className="text-muted-foreground">
            {isLogin ? "Welcome back to global music discovery" : "Join the global music journey"}
          </p>
        </div>

        <div className="bg-card/50 backdrop-blur-sm p-8 rounded-lg border border-border shadow-xl space-y-6">
          <div className="flex gap-2">
            <Button
              variant={authMethod === "email" ? "default" : "outline"}
              onClick={() => setAuthMethod("email")}
              className="flex-1"
            >
              Email
            </Button>
            <Button
              variant={authMethod === "phone" ? "default" : "outline"}
              onClick={() => setAuthMethod("phone")}
              className="flex-1"
            >
              Phone
            </Button>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleAuth)} className="space-y-4">
              {authMethod === "email" ? (
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="your@email.com"
                          {...field}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : (
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input
                          type="tel"
                          placeholder="+1234567890"
                          {...field}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Loading..." : isLogin ? "Sign In" : "Sign Up"}
              </Button>
            </form>
          </Form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Sign in with Google
          </Button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-primary hover:underline"
              disabled={isLoading}
            >
              {isLogin
                ? "Don't have an account? Sign up"
                : "Already have an account? Sign in"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
