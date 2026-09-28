import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function Nav() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setLoggedIn(!!data.session);
      setReady(true);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setLoggedIn(!!session);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate("/");
  }

  return (
    <nav className="max-w-[1100px] mx-auto flex items-center justify-between px-6 py-4">
      <Link to="/" className="text-[22px] font-display font-extrabold">
        Hat<span className="text-red">is</span>
      </Link>

      {ready && (
        <div className="flex items-center gap-1.5">
          {loggedIn ? (
            <>
              <button
                onClick={handleLogout}
                className="text-sm font-semibold text-ink-soft px-3.5 py-2.5"
              >
                Log out
              </button>
              <Link
                to="/dashboard"
                className="bg-indigo text-canvas px-5 py-2.5 rounded-pill text-sm font-semibold"
              >
                Dashboard
              </Link>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm font-semibold text-ink-soft px-3.5 py-2.5">
                Log in
              </Link>
              <Link
                to="/become-creator"
                className="bg-indigo text-canvas px-5 py-2.5 rounded-pill text-sm font-semibold"
              >
                Become a creator
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
