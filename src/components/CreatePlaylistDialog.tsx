import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Plus, Loader2 } from 'lucide-react';
import { usePlaylists } from '@/hooks/usePlaylists';

interface CreatePlaylistDialogProps {
  regionId?: string | null;
  regionName?: string;
}

export const CreatePlaylistDialog = ({ regionId, regionName }: CreatePlaylistDialogProps) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [linkToRegion, setLinkToRegion] = useState(true);

  const { createPlaylist, currentUserId } = usePlaylists();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    await createPlaylist.mutateAsync({
      name: name.trim(),
      description: description.trim() || undefined,
      regionId: linkToRegion ? regionId || undefined : undefined,
      isPublic,
    });

    setName('');
    setDescription('');
    setIsPublic(false);
    setLinkToRegion(true);
    setOpen(false);
  };

  if (!currentUserId) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Plus className="w-4 h-4" />
          New Playlist
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Playlist</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Playlist Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Regional Discoveries"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A collection of my favorite tracks..."
              rows={3}
            />
          </div>

          {regionId && regionName && (
            <div className="flex items-center justify-between py-2">
              <div className="space-y-0.5">
                <Label>Link to {regionName}</Label>
                <p className="text-xs text-muted-foreground">
                  Associate this playlist with the region
                </p>
              </div>
              <Switch
                checked={linkToRegion}
                onCheckedChange={setLinkToRegion}
              />
            </div>
          )}

          <div className="flex items-center justify-between py-2">
            <div className="space-y-0.5">
              <Label>Public Playlist</Label>
              <p className="text-xs text-muted-foreground">
                Anyone can view this playlist
              </p>
            </div>
            <Switch
              checked={isPublic}
              onCheckedChange={setIsPublic}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!name.trim() || createPlaylist.isPending}>
              {createPlaylist.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Create Playlist
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
