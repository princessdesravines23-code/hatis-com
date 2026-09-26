import type { Creator } from "../types/creator";

// Placeholder data. Replace with a Supabase query (e.g. supabase.from('creators').select())
// once the backend is wired up — the shape of this array should match the `creators`
// table joined with `payment_methods`, `social_links`, and `membership_tiers`.
export const creators: Creator[] = [
  {
    slug: "djemylaurent",
    name: "Djemy Laurent",
    cats: ["Musician"],
    initials: "DL",
    c1: "#14213D",
    c2: "#2A9D8F",
    supporters: 214,
    bio: "Kompa and zouk producer based in Port-au-Prince. Been releasing tracks independently since 2019 — every beat mixed in my bedroom studio. Sipò ou pèmèt mwen kontinye kreye san mwen pa gen pou m ap chèche yon lòt travay.",
    socials: ["Instagram", "TikTok", "YouTube"],
    tiers: [
      { name: "Tanbou Club", price: "$3/mo", desc: "Early access to new tracks before they drop anywhere else, plus the group chat." },
      { name: "Studio Pass", price: "$8/mo", desc: "Everything above, plus behind-the-scenes studio sessions and stems." },
      { name: "Producer Circle", price: "$20/mo", desc: "Direct feedback line — send me your own beats once a month for notes." },
    ],
    feed: [
      { name: "M.", action: "sent support" },
      { name: "Anonymous", action: "joined Studio Pass" },
      { name: "J. Registre", action: "sent support" },
      { name: "Anonymous", action: "joined Tanbou Club" },
    ],
  },
  {
    slug: "petersonauguste",
    name: "Peterson Auguste",
    cats: ["Comedian", "Streamer"],
    initials: "PA",
    c1: "#D7263D",
    c2: "#F2B134",
    supporters: 389,
    bio: "Sketch comedy in Kreyòl and French, three nights a week live. Started doing this to make my cousins laugh during the blackouts — now it's a whole thing. Chak dola ede m achte pi bon materyèl pou nou ri pi byen ansanm.",
    socials: ["TikTok", "Instagram", "Facebook"],
    tiers: [
      { name: "Fanmi", price: "$2/mo", desc: "Shoutout in the next live stream and access to the supporters-only chat." },
      { name: "VIP Ri", price: "$6/mo", desc: "Vote on next week's sketch topic and get early cuts before they post." },
    ],
    feed: [
      { name: "Naomi", action: "joined VIP Ri" },
      { name: "Anonymous", action: "sent support" },
      { name: "K. Bien-Aimé", action: "sent support" },
      { name: "Anonymous", action: "joined Fanmi" },
      { name: "T.", action: "sent support" },
    ],
  },
  {
    slug: "nadegemichel",
    name: "Nadège Michel",
    cats: ["Artist"],
    initials: "NM",
    c1: "#2A9D8F",
    c2: "#14213D",
    supporters: 156,
    bio: "Digital illustrator — modern takes on vodou flag motifs and Haitian folklore, sold as prints and used in a few local murals now. Trying to build this into a full-time practice.",
    socials: ["Instagram", "Behance"],
    tiers: [
      { name: "Kolektè", price: "$5/mo", desc: "First look at new pieces, plus a monthly wallpaper drop." },
      { name: "Patwon", price: "$15/mo", desc: "A signed print mailed to you twice a year, plus your name in the credits." },
    ],
    feed: [
      { name: "Anonymous", action: "joined Kolektè" },
      { name: "R. Joseph", action: "sent support" },
      { name: "Anonymous", action: "sent support" },
    ],
  },
  {
    slug: "rubenetienne",
    name: "Ruben Etienne",
    cats: ["Developer"],
    initials: "RE",
    c1: "#F2B134",
    c2: "#D7263D",
    supporters: 71,
    bio: "Building small open-source tools for Haitian devs — payment integrations, Kreyòl keyboard layouts, that kind of thing. Documenting everything so the next person doesn't have to start from zero.",
    socials: ["GitHub", "X"],
    tiers: [
      { name: "Sipòtè", price: "$4/mo", desc: "Name listed as a sponsor on every repo README." },
      { name: "Kontribitè", price: "$12/mo", desc: "Priority on feature requests and a monthly dev-log email." },
    ],
    feed: [
      { name: "Anonymous", action: "joined Sipòtè" },
      { name: "D. Charles", action: "sent support" },
    ],
  },
  {
    slug: "claudettepierre",
    name: "Claudette Pierre",
    cats: ["Teacher"],
    initials: "CP",
    c1: "#14213D",
    c2: "#F2B134",
    supporters: 98,
    bio: "Former public school teacher, now making free Kreyòl literacy and math lessons for kids who don't have a classroom right now. Filmed on my phone, edited between shifts.",
    socials: ["YouTube", "Facebook"],
    tiers: [
      {