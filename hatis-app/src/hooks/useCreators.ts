import { useEffect, useState } from "react";
import { getCreators } from "../data/creators";
import type { Creator } from "../types/creator";

export function useCreators() {
  const [creators, setCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const data = await getCreators();
        // Supporter accounts don't get a public catalogue card.
        if (active) setCreators(data.filter((c) => c.accountType === "creator"));
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : "Something went wrong.");
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, []);

  return { creators, loading, error };
}