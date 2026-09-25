export interface FeedItem {
  name: string;
  action: string;
}

export interface Tier {
  name: string;
  price: string;
  desc: string;
}

export interface Creator {
  slug: string;
  name: string;
  cats: string[];
  initials: string;
  c1: string;
  c2: string;
  supporters: number;
  bio: string;
  socials: string[];
  tiers: Tier[];
  feed: FeedItem[];
}