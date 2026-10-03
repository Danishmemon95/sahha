import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export type Locale = "en" | "ar";

interface Translations {
  // Navigation
  nav_brand: string;
  nav_signin: string;
  nav_dashboard: string;
  nav_language: string;

  // Hero section
  hero_tagline: string;
  hero_title_1: string;
  hero_title_2: string;
  hero_description: string;
  hero_cta_waitlist: string;
  hero_cta_signin: string;

  // Features section
  features_title: string;
  features_subtitle: string;
  feature_1_title: string;
  feature_1_desc: string;
  feature_2_title: string;
  feature_2_desc: string;
  feature_3_title: string;
  feature_3_desc: string;
  feature_4_title: string;
  feature_4_desc: string;

  // Waitlist section
  waitlist_title: string;
  waitlist_subtitle: string;
  waitlist_name_label: string;
  waitlist_name_placeholder: string;
  waitlist_email_label: string;
  waitlist_email_placeholder: string;
  waitlist_submit: string;
  waitlist_submitting: string;
  waitlist_success_title: string;
  waitlist_success_message: string;
  waitlist_error: string;

  // Dashboard
  dashboard_title: string;
  dashboard_welcome: string;
  dashboard_email_label: string;
  dashboard_joined_label: string;
  dashboard_syncing: string;
  dashboard_syncing_message: string;
  dashboard_signout: string;
  dashboard_data_source: string;

  // Footer
  footer_tagline: string;
  footer_rights: string;

  // Auth
  auth_signin_title: string;
  auth_signup_title: string;
}

const translations: Record<Locale, Translations> = {
  en: {
    nav_brand: "Sahha AI",
    nav_signin: "Sign In",
    nav_dashboard: "Dashboard",
    nav_language: "العربية",

    hero_tagline: "Clinical clarity, in any language",
    hero_title_1: "Medical AI That",
    hero_title_2: "Speaks Your Language",
    hero_description:
      "AI-powered clinical documentation that understands Arabic and English medical terminology. Generate structured patient summaries, translate records in real-time, and maintain audit-ready precision across languages.",
    hero_cta_waitlist: "Join the Waitlist",
    hero_cta_signin: "Sign In",

    features_title: "Built for Gulf Healthcare",
    features_subtitle:
      "Every feature designed for the unique demands of bilingual clinical environments.",
    feature_1_title: "Bilingual Clinical Documentation",
    feature_1_desc:
      "AI that natively understands both Arabic and English medical terminology — no awkward translations, just accurate clinical language.",
    feature_2_title: "Structured Patient Summaries",
    feature_2_desc:
      "Transform unstructured clinician notes into clean, standardized summaries ready for EMR integration.",
    feature_3_title: "Real-Time Clinical Translation",
    feature_3_desc:
      "Translate clinical records between Arabic and English without losing medical precision or context.",
    feature_4_title: "Audit-Ready & Transparent",
    feature_4_desc:
      "Built for regulated healthcare — every AI output is traceable, explainable, and compliant. Not a black box.",

    waitlist_title: "Get Early Access",
    waitlist_subtitle:
      "Be among the first clinicians and administrators to experience Sahha AI.",
    waitlist_name_label: "Full Name",
    waitlist_name_placeholder: "Dr. Ahmed Al-Rashid",
    waitlist_email_label: "Work Email",
    waitlist_email_placeholder: "ahmed@hospital.ae",
    waitlist_submit: "Join the Waitlist",
    waitlist_submitting: "Joining...",
    waitlist_success_title: "You're on the list!",
    waitlist_success_message:
      "We'll be in touch soon with early access details. Thank you for your interest in Sahha AI.",
    waitlist_error: "Something went wrong. Please try again.",

    dashboard_title: "Dashboard",
    dashboard_welcome: "Welcome back",
    dashboard_email_label: "Email",
    dashboard_joined_label: "Member since",
    dashboard_syncing: "Setting up your account...",
    dashboard_syncing_message: "Your account is being synced. This usually takes just a moment.",
    dashboard_signout: "Sign Out",
    dashboard_data_source: "Data sourced from PostgreSQL, not Clerk session",

    footer_tagline: "Clinical clarity, in any language.",
    footer_rights: "All rights reserved.",

    auth_signin_title: "Sign in to Sahha AI",
    auth_signup_title: "Create your account",
  },
  ar: {
    nav_brand: "سحة AI",
    nav_signin: "تسجيل الدخول",
    nav_dashboard: "لوحة التحكم",
    nav_language: "English",

    hero_tagline: "وضوح سريري، بأي لغة",
    hero_title_1: "ذكاء اصطناعي طبي",
    hero_title_2: "يتحدث لغتك",
    hero_description:
      "توثيق سريري مدعوم بالذكاء الاصطناعي يفهم المصطلحات الطبية العربية والإنجليزية. أنشئ ملخصات منظمة للمرضى، وترجم السجلات في الوقت الفعلي، وحافظ على دقة جاهزة للتدقيق عبر اللغات.",
    hero_cta_waitlist: "انضم لقائمة الانتظار",
    hero_cta_signin: "تسجيل الدخول",

    features_title: "مصمم للرعاية الصحية في الخليج",
    features_subtitle:
      "كل ميزة مصممة للمتطلبات الفريدة لبيئات العمل السريرية ثنائية اللغة.",
    feature_1_title: "توثيق سريري ثنائي اللغة",
    feature_1_desc:
      "ذكاء اصطناعي يفهم المصطلحات الطبية العربية والإنجليزية بشكل أصلي — بدون ترجمات محرجة، فقط لغة سريرية دقيقة.",
    feature_2_title: "ملخصات منظمة للمرضى",
    feature_2_desc:
      "حوّل ملاحظات الأطباء غير المنظمة إلى ملخصات نظيفة وموحدة جاهزة للتكامل مع السجلات الطبية الإلكترونية.",
    feature_3_title: "ترجمة سريرية فورية",
    feature_3_desc:
      "ترجم السجلات السريرية بين العربية والإنجليزية دون فقدان الدقة الطبية أو السياق.",
    feature_4_title: "جاهز للتدقيق وشفاف",
    feature_4_desc:
      "مصمم للرعاية الصحية المنظمة — كل مخرجات الذكاء الاصطناعي قابلة للتتبع والتفسير والامتثال. ليس صندوقاً أسود.",

    waitlist_title: "احصل على الوصول المبكر",
    waitlist_subtitle:
      "كن من أوائل الأطباء والإداريين الذين يجربون سحة AI.",
    waitlist_name_label: "الاسم الكامل",
    waitlist_name_placeholder: "د. أحمد الراشد",
    waitlist_email_label: "البريد الإلكتروني للعمل",
    waitlist_email_placeholder: "ahmed@hospital.ae",
    waitlist_submit: "انضم لقائمة الانتظار",
    waitlist_submitting: "جارٍ الانضمام...",
    waitlist_success_title: "أنت على القائمة!",
    waitlist_success_message:
      "سنتواصل معك قريباً بتفاصيل الوصول المبكر. شكراً لاهتمامك بسحة AI.",
    waitlist_error: "حدث خطأ ما. يرجى المحاولة مرة أخرى.",

    dashboard_title: "لوحة التحكم",
    dashboard_welcome: "مرحباً بعودتك",
    dashboard_email_label: "البريد الإلكتروني",
    dashboard_joined_label: "عضو منذ",
    dashboard_syncing: "جارٍ إعداد حسابك...",
    dashboard_syncing_message: "جارٍ مزامنة حسابك. عادةً ما يستغرق لحظة فقط.",
    dashboard_signout: "تسجيل الخروج",
    dashboard_data_source: "البيانات من قاعدة بيانات PostgreSQL، وليس جلسة Clerk",

    footer_tagline: "وضوح سريري، بأي لغة.",
    footer_rights: "جميع الحقوق محفوظة.",

    auth_signin_title: "تسجيل الدخول إلى سحة AI",
    auth_signup_title: "إنشاء حسابك",
  },
};

interface I18nContextType {
  locale: Locale;
  t: Translations;
  toggleLocale: () => void;
  isRTL: boolean;
}

const I18nContext = createContext<I18nContextType | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>(() => {
    // Persist language preference in localStorage
    const saved = localStorage.getItem("sahha-locale");
    return (saved === "ar" ? "ar" : "en") as Locale;
  });

  const isRTL = locale === "ar";

  useEffect(() => {
    // Set document direction and language
    document.documentElement.dir = isRTL ? "rtl" : "ltr";
    document.documentElement.lang = locale;
    localStorage.setItem("sahha-locale", locale);
  }, [locale, isRTL]);

  const toggleLocale = () => {
    setLocale((prev) => (prev === "en" ? "ar" : "en"));
  };

  return (
    <I18nContext.Provider
      value={{
        locale,
        t: translations[locale],
        toggleLocale,
        isRTL,
      }}
    >
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n(): I18nContextType {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return context;
}
