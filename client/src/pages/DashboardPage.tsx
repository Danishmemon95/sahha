import { useEffect, useState } from "react";
import { useAuth, useClerk } from "@clerk/react";
import { useNavigate } from "react-router-dom";
import { useI18n } from "../i18n/I18nContext";

interface UserData {
  email: string;
  createdAt: string;
}

export default function DashboardPage() {
  const { t, isRTL } = useI18n();
  const { isSignedIn, isLoaded, getToken } = useAuth();
  const { signOut } = useClerk();
  const navigate = useNavigate();

  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  // Redirect if not signed in
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      navigate("/sign-in");
    }
  }, [isLoaded, isSignedIn, navigate]);

  // Fetch user data from our own database (NOT from Clerk session)
  useEffect(() => {
    if (!isSignedIn) return;

    let retryCount = 0;
    const maxRetries = 5;

    async function fetchUserData() {
      try {
        const token = await getToken();
        const res = await fetch("/api/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.status === 404) {
          // User hasn't been synced yet (webhook delay)
          if (retryCount < maxRetries) {
            retryCount++;
            setSyncing(true);
            setTimeout(fetchUserData, 2000); // Retry after 2s
            return;
          }
          // Give up after max retries — still show syncing state
          setSyncing(true);
          setLoading(false);
          return;
        }

        if (!res.ok) {
          throw new Error("Failed to fetch user data");
        }

        const data = await res.json();
        setUserData(data);
        setSyncing(false);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch /api/me:", err);
        setLoading(false);
      }
    }

    fetchUserData();
  }, [isSignedIn, getToken]);

  if (!isLoaded || (isLoaded && !isSignedIn)) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sahha-50/30 to-white pt-28 pb-16">
      <div className="max-w-3xl mx-auto px-6">
        {/* Header */}
        <div className="mb-10 animate-fade-in-up">
          <h1 className="text-3xl md:text-4xl font-bold text-sahha-900 mb-2">
            {t.dashboard_title}
          </h1>
          <p className="text-lg text-slate-500">{t.dashboard_welcome}</p>
        </div>

        {/* Loading state */}
        {loading && !syncing && (
          <div className="flex items-center justify-center py-20 animate-fade-in">
            <div className="w-10 h-10 border-4 border-sahha-200 border-t-sahha-500 rounded-full animate-spin" />
          </div>
        )}

        {/* Syncing state (webhook hasn't fired yet) */}
        {syncing && (
          <div className="p-8 rounded-2xl bg-white border border-amber-200 shadow-lg animate-fade-in-up">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0 mt-0.5">
                <svg className="w-5 h-5 text-amber-600 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-amber-900 mb-1">
                  {t.dashboard_syncing}
                </h3>
                <p className="text-amber-700 text-sm">{t.dashboard_syncing_message}</p>
              </div>
            </div>
          </div>
        )}

        {/* User data card */}
        {userData && (
          <div className="space-y-6 animate-fade-in-up delay-100">
            <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-xl shadow-sahha-100/20">
              {/* Account info grid */}
              <div className="space-y-6">
                {/* Email */}
                <div className="flex items-center justify-between py-4 border-b border-slate-100">
                  <span className="text-sm font-medium text-slate-500">
                    {t.dashboard_email_label}
                  </span>
                  <span className="text-base font-semibold text-sahha-900" dir="ltr">
                    {userData.email}
                  </span>
                </div>

                {/* Joined date */}
                <div className="flex items-center justify-between py-4 border-b border-slate-100">
                  <span className="text-sm font-medium text-slate-500">
                    {t.dashboard_joined_label}
                  </span>
                  <span className="text-base font-semibold text-sahha-900">
                    {new Date(userData.createdAt).toLocaleDateString(
                      isRTL ? "ar-AE" : "en-US",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }
                    )}
                  </span>
                </div>
              </div>

              {/* Data source badge */}
              <div className="mt-6 flex items-center gap-2 px-3 py-2 rounded-lg bg-sahha-50 border border-sahha-100">
                <svg className="w-4 h-4 text-sahha-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
                </svg>
                <span className="text-xs font-medium text-sahha-600">
                  {t.dashboard_data_source}
                </span>
              </div>
            </div>

            {/* Sign out button */}
            <button
              onClick={() => signOut({ redirectUrl: "/" })}
              className="w-full py-3.5 text-sm font-semibold text-slate-600 hover:text-red-600 bg-white hover:bg-red-50 border border-slate-200 hover:border-red-200 rounded-xl transition-all duration-200 cursor-pointer"
            >
              {t.dashboard_signout}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
