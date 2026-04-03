import { useState } from 'react';
import { useSuggestedFriends } from '@/hooks/useSuggestedFriends';
import { useFriends } from '@/hooks/useFriends';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Music2, Globe, UserPlus } from 'lucide-react';

/** Requirement: F1.3 (encourage users to connect with others sharing their musical background). See docs/REQUIREMENTS_REFERENCE.md */

/**
 * Sidebar card showing up to 5 suggested friends scored by shared genre listening history,
 * with a home-country fallback. Each suggestion shows a match reason badge and an Add button.
 * Returns null when there are no suggestions or the user is not signed in.
 */
export const SuggestedFriends = () => {
  const { data: suggestions, isLoading } = useSuggestedFriends();
  const { sendFriendRequest, currentUserId } = useFriends();
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  if (!currentUserId || isLoading || !suggestions || suggestions.length === 0) {
    return null;
  }

  const visible = suggestions
    .filter((s) => !dismissed.has(s.profile_id))
    .slice(0, 5);

  if (visible.length === 0) return null;

  const handleAdd = async (profileId: string) => {
    await sendFriendRequest(profileId);
    setDismissed((prev) => new Set(prev).add(profileId));
  };

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="px-4 py-3 border-b border-border flex items-center gap-2">
        <Music2 className="w-4 h-4 text-primary" />
        <span className="font-medium text-sm text-foreground">People You May Vibe With</span>
      </div>

      <div className="p-4 space-y-3">
        <p className="text-xs text-muted-foreground">
          Based on your listening history and home region
        </p>

        {visible.map((suggestion) => (
          <div
            key={suggestion.profile_id}
            className="flex items-center justify-between gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors"
          >
            <div className="flex items-center gap-3 min-w-0">
              <Avatar className="w-8 h-8 flex-shrink-0">
                <AvatarImage src={suggestion.avatar_url ?? undefined} />
                <AvatarFallback className="bg-primary/20 text-primary text-xs">
                  {suggestion.display_name?.[0]?.toUpperCase() ?? '?'}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {suggestion.display_name ?? 'Anonymous'}
                </p>
                <Badge
                  variant="secondary"
                  className={
                    suggestion.match_reason === 'genre_overlap'
                      ? 'text-xs gap-1 bg-primary/10 text-primary mt-0.5'
                      : 'text-xs gap-1 bg-secondary/10 text-secondary mt-0.5'
                  }
                >
                  {suggestion.match_reason === 'genre_overlap' ? (
                    <>
                      <Music2 className="w-3 h-3" />
                      Shared genres
                    </>
                  ) : (
                    <>
                      <Globe className="w-3 h-3" />
                      Same home region
                    </>
                  )}
                </Badge>
              </div>
            </div>

            <Button
              size="icon"
              variant="ghost"
              className="w-7 h-7 flex-shrink-0 text-primary hover:bg-primary/10"
              onClick={() => handleAdd(suggestion.profile_id)}
              aria-label={`Add ${suggestion.display_name ?? 'user'}`}
            >
              <UserPlus className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};
