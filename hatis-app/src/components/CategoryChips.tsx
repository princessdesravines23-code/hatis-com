import { categories } from "../data/creators";

interface Props {
  active: string;
  onChange: (cat: string) => void;
}

export default function CategoryChips({ active, onChange }: Props) {
  return (
    <div className="max-w-[1100px] mx-auto px-6 mt-7 flex gap-2 overflow-x-auto no-scrollbar">
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => onChange(cat)}
          className={`flex-none px-4 py-2 rounded-pill border text-sm font-semibold whitespace-nowrap transition-colors ${
            active === cat
              ? "bg-ink text-canvas border-ink"
              : "bg-canvas text-ink-soft border-border hover:bg-ink hover:text-canvas hover:border-ink"
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
