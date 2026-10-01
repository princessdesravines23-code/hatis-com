export interface FeedItem {
  name: string;
  action: string;
}

export interface Tier {
  name: string;
  price: string;
  desc: string;
}

export interface PaymentMethod {
  id: string;
  type: "moncash" | "natcash" | "paypal" | "zelle" | "payoneer" | "cashapp" | "bank";
  label: string;
  value: string;
  isPrimary: boolean;
}

export interface Creator {
  id: string;
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
  avatarUrl?: string;
  coverUrl?: string;
  tagline?: string;
  language?: string;
  verified: boolean;
  supportClickCount: number;
  paymentMethods: PaymentMethod[];
  accountType: "creator" | "supporter";
  earningGoals: string[];
  interests: string[];
}