import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Lock, User as UserIcon, Eye, EyeOff, AlertCircle, ArrowRight, Loader2, Sparkles, ShieldCheck, Globe } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ar' : 'en');
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    const x = (clientX / innerWidth - 0.5) * 2;
    const y = (clientY / innerHeight - 0.5) * 2;
    setMousePos({ x, y });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    const res = await login(identifier, password, rememberMe);
    setIsLoading(false);

    if (!res.success && res.error) {
      setErrorMessage(res.error);
    }
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      className="min-h-screen min-h-[100dvh] w-full flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-x-hidden selection:bg-sky-500 selection:text-white"
    >
      {/* 1. FULL-SCREEN BACKGROUND IMAGE (COVER, CENTERED, FIXED) */}
      <div
        className="fixed inset-0 w-full h-full bg-cover bg-center bg-no-repeat pointer-events-none z-0 scale-105 transition-transform duration-1000"
        style={{
          backgroundImage: `url('/login-bg.png')`,
        }}
      ></div>

      {/* 2. ELEGANT DARK OVERLAY (APPROX 60% OPACITY FOR VISIBLE GLASS REFRACTION & HIGH READABILITY) */}
      <div className="fixed inset-0 w-full h-full bg-slate-950/60 pointer-events-none z-0"></div>

      {/* 3. INTERACTIVE MOUSE CURSOR SPOTLIGHT (DESKTOP) */}
      <div
        className="fixed w-[650px] h-[650px] rounded-full bg-gradient-to-r from-sky-400/30 via-cyan-300/25 to-blue-500/30 blur-3xl pointer-events-none transition-all duration-75 ease-out transform -translate-x-1/2 -translate-y-1/2 hidden md:block z-0"
        style={{
          left: `${(mousePos.x + 1) * 50}%`,
          top: `${(mousePos.y + 1) * 50}%`,
        }}
      ></div>

      {/* 4. CINEMATIC AMBIENT GLOW BLOBS */}
      <div className="fixed -top-36 -left-36 w-[650px] h-[650px] bg-gradient-to-tr from-sky-500/25 via-blue-500/20 to-cyan-400/25 rounded-full blur-3xl pointer-events-none animate-pulse duration-1000 z-0"></div>
      <div className="fixed -bottom-36 -right-36 w-[750px] h-[750px] bg-gradient-to-bl from-blue-600/25 via-indigo-500/20 to-sky-400/25 rounded-full blur-3xl pointer-events-none z-0"></div>

      {/* LANGUAGE SWITCHER GLASS BUTTON TOP CORNER */}
      <div className="absolute top-4 right-4 z-50">
        <button
          onClick={toggleLanguage}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/20 hover:bg-white/30 backdrop-blur-xl border border-white/30 shadow-lg text-white font-extrabold text-xs hover:scale-105 active:scale-95 transition-all cursor-pointer"
        >
          <Globe className="w-4 h-4 text-sky-300" />
          <span>{language === 'en' ? 'العربية' : 'English'}</span>
        </button>
      </div>

      {/* MAIN CONTENT CONTAINER */}
      <div className="max-w-md w-full relative z-10 my-auto py-8 animate-in fade-in zoom-in-95 duration-500 perspective-1000">
        
        {/* OFFICIAL BRANDING LOGO & PORTAL TITLE */}
        <div className="text-center mb-6">
          <div className="inline-flex flex-col items-center justify-center mb-3">
            {/* ROTATING FLOWER EMBLEM ICON ONLY (25s SMOOTH 360° GPU ROTATION) */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 mb-2 flex items-center justify-center transition-transform hover:scale-105 duration-300">
              <img
                src="/flower_emblem.png"
                alt="Al Noor United Flower Emblem"
                className="w-full h-full object-contain drop-shadow-[0_10px_25px_rgba(0,0,0,0.5)] animate-spin-slow"
              />
            </div>

            {/* STATIONARY COMPANY TEXT */}
            <img
              src="/logo_text.png"
              alt="Al Noor United Fuel Est."
              className="h-8 sm:h-9 w-auto object-contain drop-shadow-md"
            />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight drop-shadow-md">
            {t('login.title')}
          </h1>
          <p className="text-xs sm:text-sm font-bold text-sky-200 mt-1 tracking-wide drop-shadow-sm">
            {t('login.subtitle')}
          </p>
        </div>

        {/* TRUE PREMIUM GLASSMORPHISM FLOATING LOGIN CARD (20% OPACITY, BACKDROP-BLUR-3XL, AMBIENT GLOW) */}
        <div
          className="relative group bg-white/20 backdrop-blur-3xl border border-white/35 rounded-[32px] p-8 sm:p-10 shadow-[0_25px_60px_rgba(0,0,0,0.4),0_0_50px_rgba(56,189,248,0.2)] ring-1 ring-white/30 space-y-5 transition-all duration-300"
          style={{
            transform: `rotateY(${mousePos.x * 2.5}deg) rotateX(${-mousePos.y * 2.5}deg)`,
            transformStyle: 'preserve-3d',
          }}
        >
          {/* TOP GLASS SPECULAR REFLECTION HIGHLIGHT */}
          <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-white/35 via-white/10 to-transparent rounded-t-[32px] pointer-events-none"></div>

          {/* CARD HEADER */}
          <div className="relative z-10 border-b border-white/20 pb-3.5">
            <h2 className="text-xl font-black text-white tracking-tight flex items-center justify-between drop-shadow-sm">
              <span>{t('login.welcomeBack')}</span>
              <Sparkles className="w-4 h-4 text-sky-300 animate-pulse" />
            </h2>
            <p className="text-xs text-sky-100/90 font-medium mt-0.5">
              {t('login.signInPrompt')}
            </p>
          </div>

          {/* ERROR ALERT */}
          {errorMessage && (
            <div className="relative z-10 p-3.5 bg-red-500/20 border border-red-400/40 rounded-2xl text-red-100 text-xs font-bold flex items-center gap-2.5 backdrop-blur-xl animate-in fade-in duration-200 shadow-md">
              <AlertCircle className="w-4 h-4 text-red-300 shrink-0" />
              <span>{errorMessage === 'Invalid login credentials' ? t('login.invalidCredentials') : errorMessage}</span>
            </div>
          )}

          {/* FORM */}
          <form onSubmit={handleSubmit} className="relative z-10 space-y-4.5">
            
            {/* Username / Email Field */}
            <div>
              <label className="block text-xs font-bold text-sky-100 mb-1.5 drop-shadow-sm">
                {t('login.usernameLabel')}
              </label>
              <div className="relative group/input">
                <UserIcon className="w-4 h-4 text-sky-300 absolute start-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors group-focus-within/input:text-white" />
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={t('login.usernameLabel')}
                  className="w-full bg-white/15 hover:bg-white/20 focus:bg-white/25 backdrop-blur-xl border border-white/30 focus:border-white/60 rounded-2xl ps-10 pe-4 py-3 text-xs font-bold text-white placeholder-slate-300/70 focus:outline-none focus:ring-4 focus:ring-sky-400/30 transition-all duration-300 shadow-inner"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-bold text-sky-100 mb-1.5 drop-shadow-sm">
                {t('login.passwordLabel')}
              </label>
              <div className="relative group/input">
                <Lock className="w-4 h-4 text-sky-300 absolute start-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors group-focus-within/input:text-white" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('login.passwordLabel')}
                  className="w-full bg-white/15 hover:bg-white/20 focus:bg-white/25 backdrop-blur-xl border border-white/30 focus:border-white/60 rounded-2xl ps-10 pe-10 py-3 text-xs font-bold text-white placeholder-slate-300/70 focus:outline-none focus:ring-4 focus:ring-sky-400/30 transition-all duration-300 shadow-inner"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute end-3.5 top-1/2 -translate-y-1/2 text-sky-200/70 hover:text-white transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center justify-between pt-0.5">
              <label className="flex items-center gap-2 text-xs font-bold text-sky-100 cursor-pointer select-none drop-shadow-sm">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded-md border-white/40 bg-white/20 text-sky-500 focus:ring-sky-400"
                />
                <span>{t('login.rememberMe')}</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="relative overflow-hidden w-full py-3.5 bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-black text-sm rounded-2xl shadow-[0_14px_30px_rgba(14,165,233,0.4),0_0_20px_rgba(255,255,255,0.15)] hover:shadow-[0_20px_45px_rgba(14,165,233,0.5)] hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2 group/btn cursor-pointer"
            >
              {/* Button Specular Reflection Line */}
              <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/35 to-transparent pointer-events-none"></div>

              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{t('login.signingIn')}</span>
                </>
              ) : (
                <>
                  <span>{t('login.signInBtn')}</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1 rtl:rotate-180" />
                </>
              )}
            </button>
          </form>

        </div>

        {/* FOOTER COPYRIGHT TEXT (FIXED BOTTOM-CENTER ON DESKTOP/LAPTOP lg:, STANDARD BELOW-CARD FLOW ON MOBILE/TABLET - 7PX) */}
        <p className="text-center text-[7px] font-semibold text-sky-100/80 drop-shadow-sm flex items-center justify-center gap-1.5 mt-6 lg:mt-0 lg:fixed lg:bottom-5 lg:left-1/2 lg:-translate-x-1/2 lg:z-20 lg:text-slate-200/90 lg:drop-shadow-md transition-all">
          <ShieldCheck className="w-3 h-3 text-sky-300 lg:text-slate-300" />
          <span>© 2026 Al Noor United Fuel Est. (مؤسسة النور المتحدة للوقود)</span>
        </p>

      </div>
    </div>
  );
};

