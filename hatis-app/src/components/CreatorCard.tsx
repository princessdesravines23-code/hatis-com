import { Link } from "react-router-dom";
import type { Creator } from "../types/creator";

interface Props {
  creator: Creator;
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
        <svg width="12" height="12" viewBox="0 0 24 24" fill="#F2B134">
          <path d="M12 21s-6.7-4.35-9.3-8.1C1 10.1 1.6 6.6 4.6 5.1c2.2-1.1 4.6-.3 6 1.5.4.5.7 1 1 .6.3-.6.6-1.1 1-1.6 1.4-1.8 3.8-2.6 6-1.5 3 1.5 3.6 5 1.9 7.8C18.7 16.65 12 21 12 21z" />
        </svg>
        {creator.supporters} supporters
      </div>
    </Link>
  );
}