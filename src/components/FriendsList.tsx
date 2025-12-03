import { useFriends } from '@/hooks/useFriends';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, UserPlus, Check, X, Loader2 } from 'lucide-react';

export const FriendsList = () => {
  const {
    friends,
    pendingRequests,
    loading,
    currentUserId,
    acceptFriendRequest,
    rejectFriendRequest,
    removeFriend,
  } = useFriends();

  if (!currentUserId) {
    return (
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
            <Users className="w-5 h-5 text-secondary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Friends</h3>
            <p className="text-sm text-muted-foreground">Sign in to connect</p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground text-center py-4">
          Sign in to add friends and see what they're listening to
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-secondary" />
          <span className="font-medium text-sm text-foreground">Friends</span>
        </div>
        <span className="text-xs text-muted-foreground">{friends.length}</span>
      </div>

      <div className="p-4 space-y-4">
        {/* Pending Requests */}
        {pendingRequests.length > 0 && (
          <div className="space-y-3">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Pending Requests
            </p>
            {pendingRequests.map((request) => {
              const profile = request.user_profile;
              return (
                <div
                  key={request.id}
                  className="flex items-center justify-between gap-3 p-2 rounded-lg bg-muted/30"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={profile?.avatar_url || undefined} />
                      <AvatarFallback className="bg-accent/20 text-accent text-xs">
                        {profile?.display_name?.[0]?.toUpperCase() || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium text-foreground">
                      {profile?.display_name || 'Anonymous'}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="w-7 h-7 text-green-500 hover:text-green-400 hover:bg-green-500/10"
                      onClick={() => acceptFriendRequest(request.id)}
                    >
                      <Check className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="w-7 h-7 text-destructive hover:bg-destructive/10"
                      onClick={() => rejectFriendRequest(request.id)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Friends List */}
        {friends.length > 0 ? (
          <div className="space-y-2">
            {pendingRequests.length > 0 && (
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide pt-2">
                Your Friends
              </p>
            )}
            {friends.map((friendship) => {
              const profile = friendship.friend_profile || friendship.user_profile;
              return (
                <div
                  key={friendship.id}
                  className="flex items-center justify-between gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={profile?.avatar_url || undefined} />
                      <AvatarFallback className="bg-secondary/20 text-secondary text-xs">
                        {profile?.display_name?.[0]?.toUpperCase() || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium text-foreground">
                      {profile?.display_name || 'Anonymous'}
                    </span>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-xs text-muted-foreground hover:text-destructive"
                    onClick={() => removeFriend(friendship.id)}
                  >
                    Remove
                  </Button>
                </div>
              );
            })}
          </div>
        ) : pendingRequests.length === 0 ? (
          <div className="text-center py-6">
            <UserPlus className="w-8 h-8 text-muted-foreground/50 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No friends yet</p>
            <p className="text-xs text-muted-foreground/70">Find users on the map to add them</p>
          </div>
        ) : null}
      </div>
    </div>
  );
};
