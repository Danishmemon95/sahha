import { ClerkProvider } from "@clerk/react";
import { arSA } from "@clerk/localizations";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { I18nProvider, useI18n } from "./i18n/I18nContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import LandingPage from "./pages/LandingPage";
import DashboardPage from "./pages/DashboardPage";
import SignInPage from "./pages/SignInPage";
import SignUpPage from "./pages/SignUpPage";

const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

function AppRoutes() {
  const { locale } = useI18n();

  if (!CLERK_PUBLISHABLE_KEY) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-slate-800/90 backdrop-blur p-8 rounded-2xl border border-slate-700 text-center shadow-2xl">
          <div className="w-12 h-12 rounded-xl bg-sahha-500/20 text-sahha-400 flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Clerk Setup Required</h2>
          <p className="text-sm text-slate-400 mb-4 leading-relaxed">
            Please add your <code className="text-sahha-300 bg-slate-950 px-1.5 py-0.5 rounded text-xs font-mono">VITE_CLERK_PUBLISHABLE_KEY</code> in <code className="text-sahha-300 bg-slate-950 px-1.5 py-0.5 rounded text-xs font-mono">client/.env</code> to enable authentication.
          </p>
        </div>
      </div>
    );
  }

  return (
    <ClerkProvider
      publishableKey={CLERK_PUBLISHABLE_KEY}
      localization={locale === "ar" ? arSA : undefined}
    >
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/sign-in/*" element={<SignInPage />} />
            <Route path="/sign-up/*" element={<SignUpPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </ClerkProvider>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <I18nProvider>
        <AppRoutes />
      </I18nProvider>
    </BrowserRouter>
  );
}
