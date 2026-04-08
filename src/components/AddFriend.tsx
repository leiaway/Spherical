import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useFriends } from '@/hooks/useFriends';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, UserPlus, Loader2 } from 'lucide-react';
import { queryKeys } from '@/lib/queryKeys';
import { getErrorMessage } from '@/lib/queryErrors';
import { useToast } from '@/hooks/use-toast';

/** Requirement: F7 (add friend – search users, send request). See docs/REQUIREMENTS_REFERENCE.md */

interface SearchResult {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
}

/**
 * Search profiles by display_name and send friend requests. Excludes current user. Uses useFriends().sendFriendRequest.
 */
export const AddFriend = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [sendingTo, setSendingTo] = useState<string | null>(null);
  const { sendFriendRequest, currentUserId } = useFriends();
  const { toast } = useToast();

  const searchMutation = useMutation({
    mutationKey: queryKeys.friends.searchProfiles,
    mutationFn: async (term: string) => {
      if (!currentUserId) throw new Error('Not signed in');
      const { data, error } = await supabase.rpc('search_profiles_for_friends', {
        search_term: term,
        exclude_user_id: currentUserId,
      });
      if (error) throw error;
      return (data ?? []) as SearchResult[];
    },
    onSuccess: (data) => {
      setSearchResults(data);
    },
    onError: (error) => {
      toast({
        title: 'Search failed',
        description: getErrorMessage(error),
        variant: 'destructive',
      });
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const term = searchQuery.trim();
    if (!term || !currentUserId) return;
    searchMutation.mutate(term);
  };

  const handleSendRequest = async (userId: string) => {
    setSendingTo(userId);
    await sendFriendRequest(userId);
    setSendingTo(null);
    setSearchResults(prev => prev.filter(r => r.id !== userId));
  };

  if (!currentUserId) {
    return null;
  }

  const searching = searchMutation.isPending;

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-2 mb-4">
        <UserPlus className="w-4 h-4 text-primary" />
        <span className="font-medium text-sm text-foreground">Add Friends</span>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button type="submit" size="sm" disabled={searching}>
          {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search'}
        </Button>
      </form>

      {searchResults.length > 0 && (
        <div className="space-y-2">
          {searchResults.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between gap-3 p-2 rounded-lg bg-muted/30"
            >
              <div className="flex items-center gap-3">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={user.avatar_url || undefined} />
                  <AvatarFallback className="bg-primary/20 text-primary text-xs">
                    {user.display_name?.[0]?.toUpperCase() || '?'}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-foreground">
                  {user.display_name || 'Anonymous'}
                </span>
              </div>
              <Button
                size="sm"
                variant="secondary"
                className="gap-1 text-xs"
                onClick={() => handleSendRequest(user.id)}
                disabled={sendingTo === user.id}
              >
                {sendingTo === user.id ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <>
                    <UserPlus className="w-3 h-3" />
                    Add
                  </>
                )}
              </Button>
            </div>
          ))}
        </div>
      )}

      {searchQuery && searchResults.length === 0 && !searching && (
        <p className="text-sm text-muted-foreground text-center py-4">
          No users found
        </p>
      )}
    </div>
  );
};
