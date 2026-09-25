import { Link } from "react-router-dom";
import type { Creator } from "../types/creator";

interface Props {
  creator: Creator;
  /** Open the profile in a new tab instead of navigating in place. */
  newTab?: boolean;
}

export default function CreatorCard({ creator, newTab }: Props) {
  return (
    <Link
      to={`/${creator.slug}`}
      target={newTab ? "_blank" : undefined}
      rel={newTab ? "noopener noreferrer" : undefined}
      className="block bg-canvas-2 border border-border rounded-card p-[18px] transition-transform hover:-translate-y-[3px] hover:shadow-[0_10px_24px_rgba(20,33,61,0.10)]"
    >
      <div
        className="w-[52px] h-[52px] rounded-[14px] flex items-center justify-center font-display font-bold text-lg text-canvas mb-3.5"
        style={{ background: `linear-gradient(135deg, ${creator.c1}, ${creator.c2})` }}
      >
        {creator.initials}
      </div>
      <div className="text-base font-bold mb-0.5">{creator.name}</div>
      <div className="text-[12.5px] text-ink-soft font-medium">{creator.cats.join(" · ")}</div>
      <div className="mt-3 text-[12.5px] text-ink-soft flex items-center gap-[5px]">
        <span className="w-1.5 h-1.5 rounded-full bg-red" />
        {creator.supporters} supporters
      </div>
    </Link>
  );
}
