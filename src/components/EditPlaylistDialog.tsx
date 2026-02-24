import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Pencil, Loader2 } from "lucide-react";
import { usePlaylists, type Playlist } from "@/hooks/usePlaylists";

/** Requirement: F3 (curated user playlists – edit). See docs/REQUIREMENTS_REFERENCE.md */

interface EditPlaylistDialogProps {
  playlist: Playlist;
}

/**
 * Dialog to edit an existing playlist's basic metadata: name, description,
 * and public/private flag. Uses usePlaylists().updatePlaylist.
 */
export const EditPlaylistDialog = ({ playlist }: EditPlaylistDialogProps) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(playlist.name);
  const [description, setDescription] = useState(playlist.description || "");
  const [isPublic, setIsPublic] = useState(playlist.is_public);

  const { updatePlaylist, currentUserId } = usePlaylists();

  if (!currentUserId || playlist.user_id !== currentUserId) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    await updatePlaylist.mutateAsync({
      id: playlist.id,
      name: name.trim(),
      description: description.trim() || undefined,
      // Keep existing region association by default
      regionId: playlist.region_id,
      isPublic,
    });

    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1">
          <Pencil className="w-4 h-4" />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Playlist</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Playlist Name</Label>
            <Input
              id="edit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Playlist name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-description">Description (optional)</Label>
            <Textarea
              id="edit-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A collection of my favorite tracks..."
              rows={3}
            />
          </div>

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
              aria-label="Public Playlist"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!name.trim() || updatePlaylist.isPending}>
              {updatePlaylist.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

