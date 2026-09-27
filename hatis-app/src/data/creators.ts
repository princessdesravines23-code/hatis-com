import { supabase } from "../lib/supabase";
import type { Creator } from "../types/creator";

export const categories = ["Musician", "Comedian", "Artist", "Developer", "Streamer", "Teacher"];

interface CreatorRow {
  username: string;
  display_name: string;
  bio: string | null;
  avatar_initials: string | null;
  gradient_from: string | null;
  gradient_to: string | null;
  category: string;
  social_links: { platform: string }[];
  membership_tiers: { name: string; price_label: string; description: string | null }[];
}

const SELECT = `
  username, display_name, bio, avatar_initials, gradient_from, gradient_to, category,
  social_links ( platform ),
  membership_tiers ( name, price_label, description )
`;

function mapRow(row: CreatorRow): Creator {
  return {
    slug: row.username,
    name: row.display_name,
    cats: [row.category],
    initials: row.avatar_initials ?? row.display_name.charAt(0),
    c1: row.gradient_from ?? "#14213D",
    c2: row.gradient_to ?? "#2A9D8F",
    supporters: 0,
    bio: row.bio ?? "",
    socials: row.social_links.map((s) => s.platform),
    tiers: row.membership_tiers.map((t) => ({
      name: t.name,
      price: t.price_label,
      desc: t.description ?? "",
    })),
    feed: [],
  };
}

export async function getCreators(): Promise<Creator[]> {
  const { data, error } = await supabase.from("creators").select(SELECT);
  if (error) throw error;
  return (data as unknown as CreatorRow[]).map(mapRow);
}

export async function getCreatorBySlug(slug: string): Promise<Creator | null> {
  const { data, error } = await supabase
    .from("creators")
    .select(SELECT)
    .eq("username", slug)
    .maybeSingle();
  if (error) throw error;
  return data ? mapRow(data as unknown as CreatorRow) : null;
}