import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Globe, Loader2 } from "lucide-react";

interface LocationPromptProps {
  onEnableLocation: () => void;
  onSkip: () => void;
  loading?: boolean;
  error?: string | null;
}

export const LocationPrompt = ({
  onEnableLocation,
  onSkip,
  loading = false,
  error = null,
}: LocationPromptProps) => {
  return (
    <Card className="max-w-md mx-auto bg-card/80 backdrop-blur border-border">
      <CardHeader className="text-center space-y-4">
        <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
          <MapPin className="w-8 h-8 text-primary" />
        </div>
        <CardTitle className="text-2xl">Discover Local Music</CardTitle>
        <CardDescription className="text-base">
          Enable location to find music popular near you and connect with your local culture
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm text-center">
            {error}
          </div>
        )}
        
        <Button
          onClick={onEnableLocation}
          disabled={loading}
          className="w-full gap-2"
          size="lg"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Detecting Location...
            </>
          ) : (
            <>
              <MapPin className="w-4 h-4" />
              Enable Location Services
            </>
          )}
        </Button>
        
        <Button
          onClick={onSkip}
          variant="ghost"
          className="w-full gap-2"
          size="lg"
        >
          <Globe className="w-4 h-4" />
          Explore Globally Instead
        </Button>
        
        <p className="text-xs text-muted-foreground text-center">
          Your location is only used to personalize music recommendations and is never shared
        </p>
      </CardContent>
    </Card>
  );
};
