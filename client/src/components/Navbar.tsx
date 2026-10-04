import { useI18n } from "../i18n/I18nContext";
import { useAuth, UserButton } from "@clerk/react";
import { Link } from "react-router-dom";

export default function Navbar() {
  const { t, toggleLocale } = useI18n();
  const { isSignedIn, isLoaded } = useAuth();

  return (
    <nav className="fixed top-0 inset-x-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs transition-all duration-200">
      <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center justify-between">
        {/* Brand */}
        <Link
          to="/"
          className="flex items-center gap-2.5 text-sahha-800 font-bold text-xl tracking-tight hover:text-sahha-600 transition-colors outline-none focus:outline-none focus-visible:ring-2 focus-visible:ring-sahha-500/20 rounded-xl"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sahha-500 to-sahha-700 flex items-center justify-center shadow-md">
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5"
              />
            </svg>
          </div>
          <span>{t.nav_brand}</span>
        </Link>

        {/* Right side actions */}
        <div className="flex items-center gap-3">
          {/* Language toggle */}
          <button
            onClick={toggleLocale}
            className="px-4 py-2 text-sm font-medium text-sahha-700 hover:text-sahha-900 hover:bg-sahha-100/60 rounded-lg transition-all duration-200 cursor-pointer"
            aria-label="Toggle language"
          >
            {t.nav_language}
          </button>

          {/* Auth-dependent buttons */}
          {isLoaded && !isSignedIn && (
            <Link
              to="/sign-in"
              className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-sahha-600 to-sahha-700 hover:from-sahha-700 hover:to-sahha-800 rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
            >
              {t.nav_signin}
            </Link>
          )}

          {isLoaded && isSignedIn && (
            <>
              <Link
                to="/dashboard"
                className="px-5 py-2.5 text-sm font-semibold text-sahha-700 hover:text-sahha-900 bg-sahha-50 hover:bg-sahha-100 border border-sahha-200 rounded-xl transition-all duration-200"
              >
                {t.nav_dashboard}
              </Link>
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "w-9 h-9",
                  },
                }}
              />
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
