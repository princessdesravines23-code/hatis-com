import { supabase } from "../lib/supabase";
import type { Creator, PaymentMethod } from "../types/creator";

export const categories = ["Musician", "Comedian", "Artist", "Developer", "Streamer", "Teacher"];

interface CreatorRow {
  username: string;
  display_name: string;
  bio: string | null;
  avatar_initials: string | null;
  avatar_url: string | null;
  gradient_from: string | null;
  gradient_to: string | null;
  category: string | null;
  account_type: string;
  earning_goals: string[] | null;
  interests: string[] | null;
  social_links: { platform: string }[];
  membership_tiers: { name: string; price_label: string; description: string | null }[];
  payment_methods: {
    id: string;
    type: string;
    label: string;
    value: string;
    is_primary: boolean;
  }[];
}

const SELECT = `
  username, display_name, bio, avatar_initials, avatar_url, gradient_from, gradient_to, category,
  account_type, earning_goals, interests,
  social_links ( platform ),
  membership_tiers ( name, price_label, description ),
  payment_methods ( id, type, label, value, is_primary )
`;

function mapRow(row: CreatorRow): Creator {
  return {
    slug: row.username,
    name: row.display_name,
    cats: row.category ? [row.category] : [],
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
    avatarUrl: row.avatar_url ?? undefined,
    paymentMethods: row.payment_methods.map((p) => ({
      id: p.id,
      type: p.type as PaymentMethod["type"],
      label: p.label,
      value: p.value,
      isPrimary: p.is_primary,
    })),
    accountType: (row.account_type as "creator" | "supporter") ?? "creator",
    earningGoals: row.earning_goals ?? [],
    interests: row.interests ?? [],
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

export async function isUsernameTaken(username: string): Promise<boolean> {
  const { data, error } = await supabase
    .from("creators")
    .select("username")
    .eq("username", username)
    .maybeSingle();
  if (error) throw error;
  return !!data;
}

export async function getMyCreator(): Promise<{ id: string; creator: Creator } | null> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.user) return null;

  const { data, error } = await supabase
    .from("creators")
    .select(`id, ${SELECT}`)
    .eq("user_id", session.user.id)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;

  const { id, ...rest } = data as unknown as CreatorRow & { id: string };
  return { id, creator: mapRow(rest as CreatorRow) };
}

export async function addPaymentMethod(
  creatorId: string,
  method: { type: PaymentMethod["type"]; label: string; value: string }
): Promise<void> {
  const { error } = await supabase.from("payment_methods").insert({
    creator_id: creatorId,
    type: method.type,
    label: method.label,
    value: method.value,
    is_primary: false,
  });
  if (error) throw error;
}

export async function deletePaymentMethod(id: string): Promise<void> {
  const { error } = await supabase.from("payment_methods").delete().eq("id", id);
  if (error) throw error;
}

export async function setPrimaryPaymentMethod(creatorId: string, id: string): Promise<void> {
  const { error: clearError } = await supabase
    .from("payment_methods")
    .update({ is_primary: false })
    .eq("creator_id", creatorId);
  if (clearError) throw clearError;

  const { error: setError } = await supabase
    .from("payment_methods")
    .update({ is_primary: true })
    .eq("id", id);
  if (setError) throw setError;
}