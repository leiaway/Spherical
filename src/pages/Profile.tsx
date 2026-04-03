import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Copy, Key, Mail, User, MapPin, Save } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";

type Profile = Tables<"profiles">;

/** User profile page: display and edit user information including Mapbox token. */
const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mapboxToken, setMapboxToken] = useState<string>("");
  const [editedProfile, setEditedProfile] = useState<Partial<Profile>>({});

  // Load user profile and Mapbox token on mount
  useEffect(() => {
    if (!user) return;

    const loadProfile = async () => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (error) throw error;
        setProfile(data);
        setEditedProfile(data);
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to load profile",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    // Load Mapbox token from localStorage
    const savedToken = localStorage.getItem("mapbox_token");
    if (savedToken) {
      setMapboxToken(savedToken);
    }

    loadProfile();
  }, [user, toast]);

  const handleSaveProfile = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update(editedProfile)
        .eq("id", user.id);

      if (error) throw error;

      setProfile({ ...profile, ...editedProfile } as Profile);
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateMapboxToken = (newToken: string) => {
    if (newToken.trim()) {
      localStorage.setItem("mapbox_token", newToken.trim());
      setMapboxToken(newToken.trim());
      toast({
        title: "Success",
        description: "Mapbox token updated successfully",
      });
    }
  };

  const handleCopyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: `${label} copied to clipboard`,
    });
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/95 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/95 flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">Please sign in</h2>
          <Button onClick={() => navigate("/auth")}>Sign In</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/95">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          className="mb-6 gap-2"
          onClick={() => navigate("/")}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Button>

        <div className="max-w-2xl mx-auto space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">
              Profile Settings
            </h1>
            <p className="text-muted-foreground">
              Manage your account information and preferences
            </p>
          </div>

          {/* Account Information Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Account Information
              </CardTitle>
              <CardDescription>
                Your account details from sign-in
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Email/Phone */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email or Phone
                </Label>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    value={user.email || user.phone || "N/A"}
                    disabled
                    className="bg-muted"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() =>
                      handleCopyToClipboard(user.email || user.phone || "", "Email/Phone")
                    }
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* User ID */}
              <div className="space-y-2">
                <Label>User ID</Label>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    value={user.id}
                    disabled
                    className="bg-muted font-mono text-sm"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleCopyToClipboard(user.id, "User ID")}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profile Information Card */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Customize your public profile details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Display Name */}
              <div className="space-y-2">
                <Label htmlFor="display_name">Display Name</Label>
                <Input
                  id="display_name"
                  placeholder="Your display name"
                  value={editedProfile.display_name || ""}
                  onChange={(e) =>
                    setEditedProfile({
                      ...editedProfile,
                      display_name: e.target.value,
                    })
                  }
                />
              </div>

              {/* Home Country */}
              <div className="space-y-2">
                <Label htmlFor="home_country" className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Home Country
                </Label>
                <Input
                  id="home_country"
                  placeholder="Your home country"
                  value={editedProfile.home_country || ""}
                  onChange={(e) =>
                    setEditedProfile({
                      ...editedProfile,
                      home_country: e.target.value,
                    })
                  }
                />
              </div>

              {/* Save Button */}
              <Button
                onClick={handleSaveProfile}
                disabled={saving}
                className="w-full gap-2"
              >
                <Save className="w-4 h-4" />
                {saving ? "Saving..." : "Save Profile"}
              </Button>
            </CardContent>
          </Card>

          {/* Mapbox Token Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="w-5 h-5" />
                Mapbox Configuration
              </CardTitle>
              <CardDescription>
                Manage your Mapbox public token for the user map feature
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {mapboxToken ? (
                <>
                  <div className="space-y-2">
                    <Label>Current Mapbox Token</Label>
                    <div className="flex gap-2">
                      <Input
                        type="password"
                        value={mapboxToken}
                        disabled
                        className="bg-muted font-mono text-sm"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() =>
                          handleCopyToClipboard(mapboxToken, "Mapbox Token")
                        }
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="new_token">Update Token</Label>
                    <Input
                      id="new_token"
                      type="password"
                      placeholder="pk.eyJ1..."
                      className="font-mono text-sm"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && e.currentTarget.value.trim()) {
                          handleUpdateMapboxToken(e.currentTarget.value);
                          e.currentTarget.value = "";
                        }
                      }}
                    />
                    <p className="text-xs text-muted-foreground">
                      Press Enter to update or paste a new token and press Enter
                    </p>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      localStorage.removeItem("mapbox_token");
                      setMapboxToken("");
                      toast({
                        title: "Success",
                        description: "Mapbox token removed",
                      });
                    }}
                  >
                    Remove Token
                  </Button>
                </>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    No Mapbox token configured yet. Add one to enable the user
                    map feature.
                  </p>
                  <div className="space-y-2">
                    <Label htmlFor="new_token">Mapbox Public Token</Label>
                    <Input
                      id="new_token"
                      type="password"
                      placeholder="pk.eyJ1..."
                      className="font-mono text-sm"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && e.currentTarget.value.trim()) {
                          handleUpdateMapboxToken(e.currentTarget.value);
                          e.currentTarget.value = "";
                        }
                      }}
                    />
                    <p className="text-xs text-muted-foreground">
                      Get your free token at{" "}
                      <a
                        href="https://mapbox.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        mapbox.com
                      </a>
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
