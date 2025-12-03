import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  ListMusic,
  MoreVertical,
  Trash2,
  Globe,
  Lock,
  Music,
  MapPin,
  Share2,
  Users,
} from 'lucide-react';
import { usePlaylists, usePlaylistTracks, type Playlist } from '@/hooks/usePlaylists';
import { CreatePlaylistDialog } from './CreatePlaylistDialog';
import { SharePlaylistDialog } from './SharePlaylistDialog';
import { TrackCard } from './TrackCard';

interface PlaylistManagerProps {
  regionId?: string | null;
  regionName?: string;
}

export const PlaylistManager = ({ regionId, regionName }: PlaylistManagerProps) => {
  const { playlists, sharedPlaylists, isLoading, deletePlaylist, currentUserId } = usePlaylists();
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const { data: playlistTracks } = usePlaylistTracks(selectedPlaylist?.id || null);

  if (!currentUserId) {
    return (
      <Card className="bg-card/60 border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <ListMusic className="w-5 h-5 text-primary" />
            Playlists
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            Sign in to create and share playlists
          </p>
        </CardContent>
      </Card>
    );
  }

  const allPlaylists = [...playlists, ...sharedPlaylists.map(p => ({ ...p, isShared: true }))];

  return (
    <>
      <Card className="bg-card/60 border-border/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <ListMusic className="w-5 h-5 text-primary" />
              Playlists
            </CardTitle>
            <CreatePlaylistDialog regionId={regionId} regionName={regionName} />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-6">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : allPlaylists.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No playlists yet. Create your first one!
            </p>
          ) : (
            <ScrollArea className="max-h-[300px]">
              <div className="space-y-2">
                {allPlaylists.map((playlist) => (
                  <div
                    key={playlist.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer group"
                    onClick={() => setSelectedPlaylist(playlist)}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Music className="w-5 h-5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-sm truncate">{playlist.name}</h4>
                          {(playlist as any).isShared && (
                            <Badge variant="secondary" className="text-xs">
                              <Users className="w-3 h-3 mr-1" />
                              Shared
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          {playlist.is_public ? (
                            <Globe className="w-3 h-3" />
                          ) : (
                            <Lock className="w-3 h-3" />
                          )}
                          <span>{playlist.track_count || 0} tracks</span>
                          {playlist.region && (
                            <>
                              <span>•</span>
                              <MapPin className="w-3 h-3" />
                              <span>{playlist.region.name}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {!(playlist as any).isShared && (
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <SharePlaylistDialog playlist={playlist} />
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                deletePlaylist.mutate(playlist.id);
                              }}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Playlist Detail Dialog */}
      <Dialog open={!!selectedPlaylist} onOpenChange={() => setSelectedPlaylist(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Music className="w-5 h-5 text-primary" />
              {selectedPlaylist?.name}
            </DialogTitle>
          </DialogHeader>
          
          {selectedPlaylist?.description && (
            <p className="text-sm text-muted-foreground">{selectedPlaylist.description}</p>
          )}

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {selectedPlaylist?.is_public ? (
              <Badge variant="outline" className="gap-1">
                <Globe className="w-3 h-3" />
                Public
              </Badge>
            ) : (
              <Badge variant="outline" className="gap-1">
                <Lock className="w-3 h-3" />
                Private
              </Badge>
            )}
            {selectedPlaylist?.region && (
              <Badge variant="secondary" className="gap-1">
                <MapPin className="w-3 h-3" />
                {selectedPlaylist.region.name}
              </Badge>
            )}
          </div>

          <ScrollArea className="max-h-[400px] pr-4">
            {playlistTracks && playlistTracks.length > 0 ? (
              <div className="space-y-3">
                {playlistTracks.map((pt, index) => pt.track && (
                  <TrackCard
                    key={pt.id}
                    track={{
                      id: pt.track.id,
                      title: pt.track.title,
                      play_count: pt.track.play_count,
                      cultural_context: pt.track.cultural_context,
                      artist: pt.track.artist,
                      genre: pt.track.genre,
                    }}
                    index={index}
                  />
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                No tracks in this playlist yet
              </p>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
};
