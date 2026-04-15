import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUserRole } from "@/hooks/useUserRole";

type RequireTalentScoutProps = {
  children: React.ReactNode;
};

/**
 * Renders children only when the current user is signed in and has the talent_scout role.
 * Otherwise redirects to scout login (and signs out if they are not a scout).
 *
 * Phase 3: Non-scouts use the same global session revocation as TalentScoutLogin so refresh
 * tokens are invalidated server-side, not only cleared in this browser tab.
 */
export function RequireTalentScout({ children }: RequireTalentScoutProps) {
  const { session, isLoading } = useUserRole();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading) return;
    if (!session) {
      navigate("/talent-scout/login", { replace: true });
      return;
    }
  }, [session, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading…</p>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return <>{children}</>;
}
