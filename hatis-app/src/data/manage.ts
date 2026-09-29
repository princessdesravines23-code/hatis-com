import { supabase } from "../lib/supabase";
import { initialsFrom } from "../lib/slugify";

export interface MyProfile {
  id: string;
  userId: string;
  username: string;
  displayName: string;
  bio: string;
  interests: string[];
  avatarUrl: string | null;
  initials: string;
  c1: string;
  c2: string;
  createdAt: string | null;
}

export interface MySocialLink {
  id: string;
  platform: string;
  handle: string | null;
  url: string | null;
}

export interface MyTier {
  id: string;
  name: string;
  priceLabel: string;
  description: string;
  displayOrder: number;
}

export interface ManageData {
  profile: MyProfile;
  socials: MySocialLink[];
  tiers: MyTier[];
}

interface ManageRow {
  id: string;
  user_id: string;
  username: string;
  display_name: string;
  bio: string | null;
  category: string | null;
  interests: string[] | null;
  avatar_url: string | null;
  avatar_initials: string | null;
  gradient_from: string | null;
  gradient_to: string | null;
  created_at: string | null;
  social_links: { id: string; platform: string; handle: string | null; url: string | null }[];
  membership_tiers: {
    id: string;
    name: string;
    price_label: string;
    description: string | null;
    display_order: number | null;
  }[];
}

const MANAGE_SELECT = `
  id, user_id, username, display_name, bio, category, interests, avatar_url, avatar_initials,
  gradient_from, gradient_to, created_at,
  social_links ( id, platform, handle, url ),
  membership_tiers ( id, name, price_label, description, display_order )
`;

export async function getManageData(): Promise<ManageData | null> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.user) return null;

  const { data, error } = await supabase
    .from("creators")
    .select(MANAGE_SELECT)
    .eq("user_id", session.user.id)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;

  const row = data as unknown as ManageRow;
  const interests = row.interests && row.interests.length > 0 ? row.interests : row.category ? [row.category] : [];

  return {
    profile: {
      id: row.id,
      userId: row.user_id,
      username: row.username,
      displayName: row.display_name,
      bio: row.bio ?? "",
      interests,
      avatarUrl: row.avatar_url,
      initials: row.avatar_initials ?? initialsFrom(row.display_name),
      c1: row.gradient_from ?? "#14213D",
      c2: row.gradient_to ?? "#2A9D8F",
      createdAt: row.created_at,
    },
    socials: row.social_links.map((s) => ({
      id: s.id,
      platform: s.platform,
      handle: s.handle,
      url: s.url,
    })),
    tiers: row.membership_tiers
      .map((t) => ({
        id: t.id,
        name: t.name,
        priceLabel: t.price_label,
        description: t.description ?? "",
        displayOrder: t.display_order ?? 0,
      }))
      .sort((a, b) => a.displayOrder - b.displayOrder),
  };
}

/* ---------- Profile ---------- */

export async function updateProfile(
  creatorId: string,
  input: { displayName: string; bio: string; interests: string[] }
): Promise<void> {
  const { error } = await supabase
    .from("creators")
    .update({
      display_name: input.displayName,
      avatar_initials: initialsFrom(input.displayName),
      bio: input.bio,
      category: input.interests[0] ?? null,
      interests: input.interests,
    })
    .eq("id", creatorId);
  if (error) throw error;
}

export async function uploadAvatar(userId: string, creatorId: string, file: File): Promise<void> {
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const path = `${userId}/avatar.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(path, file, { upsert: true });
  if (uploadError) throw new Error(`Photo upload failed: ${uploadError.message}`);

  const { data } = supabase.storage.from("avatars").getPublicUrl(path);
  // The path is the same every time, so add a version to stop browsers showing the old photo.
  const url = `${data.publicUrl}?v=${Date.now()}`;

  const { error } = await supabase.from("creators").update({ avatar_url: url }).eq("id", creatorId);
  if (error) throw error;
}

export async function removeAvatar(creatorId: string): Promise<void> {
  const { error } = await supabase.from("creators").update({ avatar_url: null }).eq("id", creatorId);
  if (error) throw error;
}

/* ---------- Social links ---------- */

export async function addSocialLink(
  creatorId: string,
  link: { platform: string; handle: string | null; url: string }
): Promise<void> {
  const { error } = await supabase.from("social_links").insert({
    creator_id: creatorId,
    platform: link.platform,
    handle: link.handle,
    url: link.url,
  });
  if (error) throw error;
}

export async function deleteSocialLink(id: string): Promise<void> {
  const { error } = await supabase.from("social_links").delete().eq("id", id);
  if (error) throw error;
}

/* ---------- Membership tiers ---------- */

export async function addTier(
  creatorId: string,
  tier: { name: string; priceLabel: string; description: string; displayOrder: number }
): Promise<void> {
  const { error } = await supabase.from("membership_tiers").insert({
    creator_id: creatorId,
    name: tier.name,
    price_label: tier.priceLabel,
    description: tier.description,
    display_order: tier.displayOrder,
  });
  if (error) throw error;
}

export async function updateTier(
  id: string,
  tier: { name: string; priceLabel: string; description: string }
): Promise<void> {
  const { error } = await supabase
    .from("membership_tiers")
    .update({
      name: tier.name,
      price_label: tier.priceLabel,
      description: tier.description,
    })
    .eq("id", id);
  if (error) throw error;
}

export async function deleteTier(id: string): Promise<void> {
  const { error } = await supabase.from("membership_tiers").delete().eq("id", id);
  if (error) throw error;
}
