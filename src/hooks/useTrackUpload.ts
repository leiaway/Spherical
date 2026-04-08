import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

/** Requirement: F1.4 (user song tagging with location and genre for local discovery). See docs/REQUIREMENTS_REFERENCE.md */

export interface TrackUploadInput {
  title: string;
  artistName: string;
  regionId: string;
  genreId: string;
  culturalContext?: string;
  mood?: string;
  audioUrl?: string;
  coverImageUrl?: string;
  youtubeUrl?: string;
}

/**
 * Mutation hook for uploading a track with location and genre tagging.
 * Upserts the artist by name first, then inserts the track.
 * Invalidates region-tracks queries on success so the discovery feed refreshes.
 *
 * @example
 * const { upload, isPending } = useTrackUpload();
 * await upload.mutateAsync({ title: 'Song', artistName: 'Artist', regionId, genreId });
 */
export const useTrackUpload = () => {
  const queryClient = useQueryClient();

  const upload = useMutation({
    mutationFn: async (input: TrackUploadInput) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Must be signed in to upload tracks');

      // Step 1: look up existing artist by name, or insert a new one
      let artistId: string;

      const { data: existing } = await supabase
        .from('artists')
        .select('id')
        .eq('name', input.artistName.trim())
        .maybeSingle();

      if (existing) {
        artistId = existing.id;
      } else {
        const { data: newArtist, error: artistError } = await supabase
          .from('artists')
          .insert({ name: input.artistName.trim(), region_id: input.regionId })
          .select('id')
          .single();

        if (artistError) throw artistError;
        artistId = newArtist.id;
      }

      // Step 2: insert the track with all tags
      const { data: track, error: trackError } = await (supabase as any)
        .from('tracks')
        .insert({
          title: input.title.trim(),
          artist_id: artistId,
          region_id: input.regionId,
          genre_id: input.genreId,
          cultural_context: input.culturalContext?.trim() || null,
          mood: input.mood || null,
          audio_url: input.audioUrl?.trim() || null,
          cover_image_url: input.coverImageUrl?.trim() || null,
          youtube_url: input.youtubeUrl?.trim() || null,
        })
        .select('id')
        .single();

      if (trackError) throw trackError;
      return track;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['region-tracks'] });
      queryClient.invalidateQueries({ queryKey: ['personalized-region-tracks'] });
    },
  });

  return { upload };
};
