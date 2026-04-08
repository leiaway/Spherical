import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { queryKeys } from "@/lib/queryKeys";

export function useGenres() {
  return useQuery({
    queryKey: queryKeys.genres.all,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("genres")
        .select("id, name")
        .order("name");
      if (error) throw error;
      return data;
    },
  });
}
