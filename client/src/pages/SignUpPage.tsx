import { SignUp } from "@clerk/react";
import { useI18n } from "../i18n/I18nContext";

export default function SignUpPage() {
  const { t } = useI18n();

  return (
    <div className="min-h-screen bg-gradient-to-br from-sahha-50 via-white to-sahha-100/50 pt-28 pb-16 flex items-center justify-center">
      <div className="w-full max-w-md px-6 animate-fade-in-up">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-sahha-900">{t.auth_signup_title}</h1>
        </div>
        <SignUp
          routing="path"
          path="/sign-up"
          signInUrl="/sign-in"
          fallbackRedirectUrl="/dashboard"
          appearance={{
            elements: {
              rootBox: "w-full",
              card: "rounded-2xl shadow-xl shadow-sahha-100/30 border border-slate-200",
              headerTitle: "text-sahha-900",
              headerSubtitle: "text-slate-500",
              socialButtonsBlockButton:
                "border-slate-200 hover:bg-slate-50 transition-colors",
              formButtonPrimary:
                "bg-gradient-to-r from-sahha-600 to-sahha-700 hover:from-sahha-700 hover:to-sahha-800 shadow-lg shadow-sahha-500/20",
              footerActionLink: "text-sahha-600 hover:text-sahha-700",
              formFieldInput:
                "rounded-xl border-slate-200 focus:ring-sahha-400/40 focus:border-sahha-400",
            },
          }}
        />
      </div>
    </div>
  );
}
