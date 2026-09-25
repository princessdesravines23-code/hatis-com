import { Link } from "react-router-dom";

export default function Nav() {
  return (
    <nav className="max-w-[1100px] mx-auto flex items-center justify-between px-6 py-4">
      <Link to="/" className="text-[22px] font-display font-extrabold">
        Hat<span className="text-red">is</span>
      </Link>
      <button className="bg-indigo text-canvas px-5 py-2.5 rounded-pill text-sm font-semibold">
        Become a creator
      </button>
    </nav>
  );
}
