import { useState, useRef, type FormEvent, type ReactNode } from "react";
import { useI18n } from "../i18n/I18nContext";
import { Link } from "react-router-dom";

export default function LandingPage() {

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <HeroSection />

      {/* Features Section */}
      <FeaturesSection />

      {/* Waitlist Section */}
      <WaitlistSection />
    </div>
  );
}

/* ─── Hero ────────────────────────────────────────────────────────── */
function HeroSection() {
  const { t } = useI18n();

  return (
    <section className="relative pt-32 pb-20 md:pt-44 md:pb-32 overflow-hidden">
      {/* Background gradient mesh */}
      <div className="absolute inset-0 bg-gradient-to-br from-sahha-50 via-white to-sahha-100/50" />
      <div className="absolute top-0 end-0 w-[600px] h-[600px] bg-sahha-200/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
      <div className="absolute bottom-0 start-0 w-[400px] h-[400px] bg-accent-200/20 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4" />

      {/* Floating decorative elements */}
      <div className="absolute top-32 end-[15%] w-16 h-16 rounded-2xl bg-gradient-to-br from-sahha-300/20 to-sahha-500/20 rotate-12 animate-float" />
      <div className="absolute top-60 start-[10%] w-12 h-12 rounded-xl bg-gradient-to-br from-accent-300/20 to-accent-500/20 -rotate-12 animate-float delay-200" />
      <div className="absolute bottom-20 end-[25%] w-10 h-10 rounded-lg bg-gradient-to-br from-sahha-400/15 to-sahha-600/15 rotate-45 animate-float delay-400" />

      <div className="relative max-w-7xl mx-auto px-6 text-center">
        {/* Tagline badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sahha-100/80 border border-sahha-200/60 text-sahha-700 text-sm font-medium mb-8 animate-fade-in-up">
          <span className="w-2 h-2 rounded-full bg-sahha-500 animate-pulse" />
          {t.hero_tagline}
        </div>

        {/* Main heading */}
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-sahha-900 leading-tight tracking-tight mb-6 animate-fade-in-up delay-100">
          {t.hero_title_1}
          <br />
          <span className="bg-gradient-to-r from-sahha-500 to-sahha-700 bg-clip-text text-transparent animate-gradient">
            {t.hero_title_2}
          </span>
        </h1>

        {/* Description */}
        <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-600 leading-relaxed mb-10 animate-fade-in-up delay-200">
          {t.hero_description}
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up delay-300">
          <a
            href="#waitlist"
            className="px-8 py-4 text-base font-semibold text-white bg-gradient-to-r from-sahha-600 to-sahha-700 hover:from-sahha-700 hover:to-sahha-800 rounded-2xl shadow-lg shadow-sahha-500/25 hover:shadow-xl hover:shadow-sahha-500/30 transition-all duration-300 hover:-translate-y-0.5"
          >
            {t.hero_cta_waitlist}
          </a>
          <Link
            to="/sign-in"
            className="px-8 py-4 text-base font-semibold text-sahha-700 bg-white hover:bg-sahha-50 border-2 border-sahha-200 hover:border-sahha-300 rounded-2xl transition-all duration-300 hover:-translate-y-0.5"
          >
            {t.hero_cta_signin}
          </Link>
        </div>

        {/* Trust indicators */}
        <div className="mt-16 flex flex-col items-center animate-fade-in-up delay-500">
          <p className="text-xs uppercase tracking-widest text-slate-400 mb-4 font-medium">
            {isArabic() ? "مصمم للبيئات السريرية المنظمة" : "Designed for regulated clinical environments"}
          </p>
          <div className="flex items-center gap-6 text-slate-400">
            <TrustBadge icon="shield" label={isArabic() ? "متوافق مع HIPAA" : "HIPAA Aligned"} />
            <TrustBadge icon="lock" label={isArabic() ? "تشفير شامل" : "End-to-End Encrypted"} />
            <TrustBadge icon="check" label={isArabic() ? "جاهز للتدقيق" : "Audit Ready"} />
          </div>
        </div>
      </div>
    </section>
  );
}

function isArabic() {
  return document.documentElement.dir === "rtl";
}

function TrustBadge({ icon, label }: { icon: string; label: string }) {
  const icons: Record<string, ReactNode> = {
    shield: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
      </svg>
    ),
    lock: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
      </svg>
    ),
    check: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
      </svg>
    ),
  };

  return (
    <div className="flex items-center gap-1.5 text-xs font-medium">
      {icons[icon]}
      <span>{label}</span>
    </div>
  );
}

/* ─── Features ────────────────────────────────────────────────────── */
function FeaturesSection() {
  const { t } = useI18n();

  const features = [
    {
      title: t.feature_1_title,
      description: t.feature_1_desc,
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="m10.5 21 5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 0 1 6-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364V3m-3.334 2.25a48.33 48.33 0 0 0-3.334.114M9 5.25c0 .27.01.538.03.804m6.608-1.59c.285.02.569.044.851.07m.297 2.716a48.648 48.648 0 0 1-.85-.071m.851.071c.478.057.953.12 1.424.188m-1.424-.188v-.196m0 0a48.407 48.407 0 0 0-6.608 0m6.608 0v.196" />
        </svg>
      ),
      gradient: "from-sahha-500 to-sahha-700",
    },
    {
      title: t.feature_2_title,
      description: t.feature_2_desc,
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
        </svg>
      ),
      gradient: "from-sahha-400 to-sahha-600",
    },
    {
      title: t.feature_3_title,
      description: t.feature_3_desc,
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
        </svg>
      ),
      gradient: "from-accent-500 to-accent-600",
    },
    {
      title: t.feature_4_title,
      description: t.feature_4_desc,
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
        </svg>
      ),
      gradient: "from-sahha-600 to-sahha-800",
    },
  ];

  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-sahha-900 mb-4">
            {t.features_title}
          </h2>
          <p className="max-w-2xl mx-auto text-lg text-slate-500">
            {t.features_subtitle}
          </p>
        </div>

        {/* Feature cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative p-8 rounded-2xl bg-slate-50 hover:bg-white border border-slate-100 hover:border-sahha-200/60 hover:shadow-xl hover:shadow-sahha-100/50 transition-all duration-500"
            >
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center text-white mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}
              >
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-sahha-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-slate-500 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Waitlist Form ───────────────────────────────────────────────── */
function WaitlistSection() {
  const { t } = useI18n();
  const [formState, setFormState] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormState("submitting");
    setErrorMsg("");

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || t.waitlist_error);
      }

      setFormState("success");
    } catch (err: any) {
      setErrorMsg(err.message || t.waitlist_error);
      setFormState("error");
    }
  }

  return (
    <section id="waitlist" className="py-20 md:py-28 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-white via-sahha-50/50 to-sahha-100/30" />
      <div className="absolute top-0 start-1/2 w-[800px] h-[400px] bg-sahha-200/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />

      <div className="relative max-w-xl mx-auto px-6">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-sahha-900 mb-4">
            {t.waitlist_title}
          </h2>
          <p className="text-lg text-slate-500">{t.waitlist_subtitle}</p>
        </div>

        {formState === "success" ? (
          <div className="text-center p-10 rounded-2xl bg-white border border-sahha-200 shadow-lg animate-fade-in-up">
            <div className="w-16 h-16 rounded-full bg-sahha-100 flex items-center justify-center mx-auto mb-5">
              <svg className="w-8 h-8 text-sahha-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-sahha-900 mb-2">
              {t.waitlist_success_title}
            </h3>
            <p className="text-slate-500">{t.waitlist_success_message}</p>
          </div>
        ) : (
          <form
            ref={formRef}
            onSubmit={handleSubmit}
            className="p-8 md:p-10 rounded-2xl bg-white border border-slate-200 shadow-xl shadow-sahha-100/30 animate-fade-in-up"
          >
            {/* Name field */}
            <div className="mb-5">
              <label
                htmlFor="waitlist-name"
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                {t.waitlist_name_label}
              </label>
              <input
                id="waitlist-name"
                name="name"
                type="text"
                required
                placeholder={t.waitlist_name_placeholder}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sahha-400/40 focus:border-sahha-400 transition-all duration-200"
              />
            </div>

            {/* Email field */}
            <div className="mb-6">
              <label
                htmlFor="waitlist-email"
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                {t.waitlist_email_label}
              </label>
              <input
                id="waitlist-email"
                name="email"
                type="email"
                required
                dir="ltr"
                placeholder={t.waitlist_email_placeholder}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sahha-400/40 focus:border-sahha-400 transition-all duration-200"
              />
            </div>

            {/* Error message */}
            {formState === "error" && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm animate-fade-in">
                {errorMsg}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={formState === "submitting"}
              className="w-full py-4 text-base font-semibold text-white bg-gradient-to-r from-sahha-600 to-sahha-700 hover:from-sahha-700 hover:to-sahha-800 rounded-xl shadow-lg shadow-sahha-500/20 hover:shadow-xl transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {formState === "submitting" ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  {t.waitlist_submitting}
                </span>
              ) : (
                t.waitlist_submit
              )}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
