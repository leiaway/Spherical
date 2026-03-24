import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * Custom hook to manage user location preferences.
 * Encapsulates loading and persisting location preferences to the database.
 *
 * @param userId - The authenticated user's ID (or null if not authenticated)
 * @returns Object containing preference state and save handler
 */
export const useLocationPreference = (userId: string | undefined) => {
  const [locationPromptDismissed, setLocationPromptDismissed] = useState(false);
  const [loadingPreference, setLoadingPreference] = useState(true);

  // Load location preference from database on mount
  useEffect(() => {
    const loadLocationPreference = async () => {
      if (!userId) {
        setLoadingPreference(false);
        return;
      }

      try {
        const { data } = await supabase
          .from('profiles')
          .select('location_enabled')
          .eq('id', userId)
          .single();

        // If user has already made a choice (location_enabled is not null), dismiss the prompt
        if (data?.location_enabled !== null) {
          setLocationPromptDismissed(true);
        }
      } catch (error) {
        console.error('Failed to load location preference:', error);
      } finally {
        setLoadingPreference(false);
      }
    };

    loadLocationPreference();
  }, [userId]);

  /**
   * Save location preference to database
   * @param locationEnabled - True if user enabled location, false otherwise
   */
  const saveLocationPreference = async (locationEnabled: boolean) => {
    if (!userId) return;

    try {
      await supabase
        .from('profiles')
        .update({ location_enabled: locationEnabled })
        .eq('id', userId);
    } catch (error) {
      console.error('Failed to save location preference:', error);
    }
  };

  /**
   * Dismiss the location prompt and save preference
   * @param locationEnabled - True if user enabled location, false if skipping
   */
  const dismissPrompt = async (locationEnabled: boolean) => {
    setLocationPromptDismissed(true);
    await saveLocationPreference(locationEnabled);
  };

  return {
    locationPromptDismissed,
    loadingPreference,
    dismissPrompt,
    setLocationPromptDismissed,
  };
};
