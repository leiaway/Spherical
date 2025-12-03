import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Share2, Check, Loader2, UserPlus } from 'lucide-react';
import { useFriends } from '@/hooks/useFriends';
import { usePlaylists, usePlaylistShares, type Playlist } from '@/hooks/usePlaylists';

interface SharePlaylistDialogProps {
  playlist: Playlist;
}

export const SharePlaylistDialog = ({ playlist }: SharePlaylistDialogProps) => {
  const [open, setOpen] = useState(false);
  const { friends } = useFriends();
  const { sharePlaylist, currentUserId } = usePlaylists();
  const { data: shares } = usePlaylistShares(open ? playlist.id : null);

  const sharedUserIds = new Set(shares?.map(s => s.shared_with_user_id) || []);

  const handleShare = async (userId: string) => {
    await sharePlaylist.mutateAsync({
      playlistId: playlist.id,
      userId,
    });
  };

  const getFriendProfile = (friendship: typeof friends[0]) => {
    if (friendship.user_id === currentUserId) {
      return friendship.friend_profile;
    }
    return friendship.user_profile;
  };

  const getFriendId = (friendship: typeof friends[0]) => {
    if (friendship.user_id === currentUserId) {
      return friendship.friend_id;
    }
    return friendship.user_id;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Share2 className="w-4 h-4" />
          Share
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share "{playlist.name}"</DialogTitle>
        </DialogHeader>

        {friends.length === 0 ? (
          <div className="py-8 text-center">
            <UserPlus className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">
              Add friends to share playlists with them
            </p>
          </div>
        ) : (
          <ScrollArea className="max-h-[300px]">
            <div className="space-y-2">
              {friends.map((friendship) => {
                const profile = getFriendProfile(friendship);
                const friendId = getFriendId(friendship);
                const isShared = sharedUserIds.has(friendId);

                return (
                  <div
                    key={friendship.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={profile?.avatar_url || undefined} />
                        <AvatarFallback className="text-xs">
                          {profile?.display_name?.[0]?.toUpperCase() || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">
                        {profile?.display_name || 'Unknown User'}
                      </span>
                    </div>

                    {isShared ? (
                      <Button variant="ghost" size="sm" disabled className="gap-2">
                        <Check className="w-4 h-4 text-green-500" />
                        Shared
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleShare(friendId)}
                        disabled={sharePlaylist.isPending}
                      >
                        {sharePlaylist.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          'Share'
                        )}
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
};
