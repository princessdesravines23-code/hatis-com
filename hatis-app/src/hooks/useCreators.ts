import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { Creator } from "../types/creator";

export function useCreators() {
  const [creators, setCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      const { data, error } = await supabase
        .from("creators")
        .select("*, payment_methods(*), social_links(*), membership_tiers(*)");

      if (!active) return;

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      const mapped: Creator[] = (data ?? []).map((row: any) => ({
        slug: row.username,
        name: row.display_name,
        cats: [row.category],
        initials: row.avatar_initials ?? row.display_name.slice(0, 2).toUpperCase(),
        c1: row.gradient_from,
        c2: row.gradient_to,
        supporters: row.supporters_count ?? 0,
        bio: row.bio ?? "",
        socials: (row.social_links ?? []).map((s: any) => s.platform),
        tiers: (row.membership_tiers ?? []).map((t: any) => ({
          name: t.name,
          price: t.price_label,
          desc: t.description ?? "",
        })),
        feed: [],
      }));

      setCreators(mapped);
      setLoading(false);
    }

    load();
    return () => {
      active = false;
    };
  }, []);

  return { creators, loading, error };
}
