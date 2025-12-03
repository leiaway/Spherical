import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Plus, ListMusic, Check, Loader2 } from 'lucide-react';
import { usePlaylists } from '@/hooks/usePlaylists';

interface AddToPlaylistButtonProps {
  trackId: string;
}

export const AddToPlaylistButton = ({ trackId }: AddToPlaylistButtonProps) => {
  const { playlists, addTrackToPlaylist, currentUserId } = usePlaylists();
  const [addingTo, setAddingTo] = useState<string | null>(null);

  if (!currentUserId) {
    return null;
  }

  const handleAdd = async (playlistId: string) => {
    setAddingTo(playlistId);
    try {
      await addTrackToPlaylist.mutateAsync({ playlistId, trackId });
    } finally {
      setAddingTo(null);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => e.stopPropagation()}
        >
          <Plus className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
          Add to playlist
        </div>
        <DropdownMenuSeparator />
        {playlists.length === 0 ? (
          <div className="px-2 py-4 text-sm text-muted-foreground text-center">
            <ListMusic className="w-8 h-8 mx-auto mb-2 opacity-50" />
            No playlists yet
          </div>
        ) : (
          playlists.map((playlist) => (
            <DropdownMenuItem
              key={playlist.id}
              onClick={(e) => {
                e.stopPropagation();
                handleAdd(playlist.id);
              }}
              disabled={addingTo === playlist.id}
            >
              {addingTo === playlist.id ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <ListMusic className="w-4 h-4 mr-2" />
              )}
              <span className="truncate">{playlist.name}</span>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
