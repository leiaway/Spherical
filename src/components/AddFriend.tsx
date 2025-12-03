import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useFriends } from '@/hooks/useFriends';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, UserPlus, Loader2 } from 'lucide-react';

interface SearchResult {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
}

export const AddFriend = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [sendingTo, setSendingTo] = useState<string | null>(null);
  const { sendFriendRequest, currentUserId } = useFriends();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim() || !currentUserId) return;

    setSearching(true);
    setSearchResults([]);

    const { data, error } = await supabase
      .from('profiles')
      .select('id, display_name, avatar_url')
      .ilike('display_name', `%${searchQuery}%`)
      .neq('id', currentUserId)
      .limit(10);

    if (!error && data) {
      setSearchResults(data);
    }
    setSearching(false);
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
