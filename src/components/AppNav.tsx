import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AppNav() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const [open, setOpen] = useState(false);

  const is = (p: string) => loc.pathname.startsWith(p);
  const closeMenu = () => setOpen(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#0b0d10]/80 backdrop-blur-md">
      <nav className="mx-auto max-w-6xl px-4 sm:px-6 py-3 flex items-center gap-3 sm:gap-6">
        
        {/* Logo */}
        <Link to="/" className="text-[18px] font-semibold tracking-tight text-white">
          SurvEase
        </Link>

        {/* Desktop Links */}
        <div className="hidden sm:flex items-center gap-4 text-[15px]">
          <Link
            to="/create"
            className={`hover:text-white/90 ${is("/create") && "text-white font-semibold"}`}
          >
            Create
          </Link>
          <Link
            to="/analytics"
            className={`hover:text-white/90 ${is("/analytics") && "text-white font-semibold"}`}
          >
            Analytics
          </Link>
          <Link
            to="/admin/responses"
            className={`hover:text-white/90 ${is("/admin") && "text-white font-semibold"}`}
          >
            Responses
          </Link>
        </div>

        <div className="ml-auto flex items-center gap-2">
          {/* Mobile Menu Toggle */}
          <button
            className="sm:hidden rounded-full border border-white/20 bg-white/10 text-white px-3 py-1.5 text-xs shadow-soft hover:bg-white/20 transition"
            onClick={() => setOpen(o => !o)}
          >
            Menu
          </button>

          {/* User Auth Buttons */}
          {!user ? (
            <>
              <Link
                to="/login"
                className="px-3 py-1.5 text-sm text-white/70 hover:text-white cursor-pointer"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="rounded-xl border border-white/20 bg-white/10 px-3 py-1.5 text-sm text-white shadow-soft hover:bg-white/20 transition"
              >
                Sign up
              </Link>
            </>
          ) : (
            <>
              <span className="hidden sm:inline text-sm text-white/70">
                Hi, {user.username}
              </span>
              <button
                onClick={() => {
                  logout();
                  nav("/");
                }}
                className="rounded-xl border border-white/20 bg-white/10 px-3 py-1.5 text-sm text-white shadow-soft hover:bg-white/20 transition"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </nav>

      {/* Mobile Dropdown */}
      {open && (
        <div className="sm:hidden border-t border-white/10 bg-[#0b0d10]/95 backdrop-blur-md">
          <div className="mx-auto max-w-6xl px-4 py-3 flex flex-col gap-2 text-sm text-white/80">
            <Link
              to="/create"
              onClick={closeMenu}
              className={`py-1 ${is("/create") && "text-white font-semibold"}`}
            >
              Create
            </Link>
            <Link
              to="/analytics"
              onClick={closeMenu}
              className={`py-1 ${is("/analytics") && "text-white font-semibold"}`}
            >
              Analytics
            </Link>
            <Link
              to="/admin/responses"
              onClick={closeMenu}
              className={`py-1 ${is("/admin") && "text-white font-semibold"}`}
            >
              Responses
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
