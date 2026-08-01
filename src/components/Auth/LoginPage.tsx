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
      className="min-h-screen bg-gradient-to-br from-sky-100 via-blue-50 via-cyan-100 to-indigo-100 flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden selection:bg-sky-500 selection:text-white"
    >
      {/* LANGUAGE SWITCHER BUTTON TOP CORNER */}
      <div className="absolute top-4 right-4 z-50">
        <button
          onClick={toggleLanguage}
          className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white/80 backdrop-blur-md border border-white/90 shadow-md text-sky-800 font-extrabold text-xs hover:bg-white transition-all"
        >
          <Globe className="w-4 h-4 text-sky-600" />
          <span>{language === 'en' ? 'العربية' : 'English'}</span>
        </button>
      </div>

      {/* 1. INTERACTIVE MOUSE CURSOR SPOTLIGHT (DESKTOP) */}
      <div
        className="absolute w-[600px] h-[600px] rounded-full bg-gradient-to-r from-sky-400/20 via-cyan-300/20 to-blue-400/20 blur-3xl pointer-events-none transition-all duration-75 ease-out transform -translate-x-1/2 -translate-y-1/2 hidden md:block"
        style={{
          left: `${(mousePos.x + 1) * 50}%`,
          top: `${(mousePos.y + 1) * 50}%`,
        }}
      ></div>

      {/* 2. CINEMATIC BACKGROUND AURORA BLOBS */}
      <div className="absolute -top-36 -left-36 w-[650px] h-[650px] bg-gradient-to-tr from-sky-400/35 via-blue-400/25 to-cyan-300/35 rounded-full blur-3xl pointer-events-none animate-pulse duration-1000"></div>
      <div className="absolute -bottom-36 -right-36 w-[750px] h-[750px] bg-gradient-to-bl from-blue-400/30 via-indigo-300/25 to-sky-300/30 rounded-full blur-3xl pointer-events-none"></div>

      {/* 3. FLOATING GLASS GEOMETRIES */}
      <div
        className="absolute top-16 left-[10%] w-28 h-28 rounded-full bg-gradient-to-br from-white/70 via-sky-200/40 to-white/10 backdrop-blur-xl border border-white/90 shadow-[0_15px_35px_rgba(14,165,233,0.18)] pointer-events-none transition-transform duration-300 ease-out hidden md:block"
        style={{ transform: `translate(${mousePos.x * -20}px, ${mousePos.y * -20}px)` }}
      ></div>

      {/* MAIN CONTENT CONTAINER */}
      <div className="max-w-md w-full relative z-10 animate-in fade-in zoom-in-95 duration-500 perspective-1000">
        
        {/* OFFICIAL BRANDING LOGO & PORTAL TITLE */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center mb-3 transition-transform hover:scale-105 duration-300">
            <img
              src="/logo_transparent.png"
              alt="Al Noor United Fuel Est. Logo"
              className="h-28 w-auto object-contain"
              style={{ background: 'transparent', filter: 'none' }}
            />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            {t('login.title')}
          </h1>
          <p className="text-xs font-bold text-sky-800 mt-0.5 tracking-wide">
            {t('login.subtitle')}
          </p>
        </div>

        {/* TRIPLE-LAYER CRYSTAL GLASS LOGIN CARD */}
        <div
          className="relative group bg-white/35 backdrop-blur-[60px] border border-white/90 rounded-[32px] p-8 sm:p-10 shadow-[0_35px_100px_rgba(14,165,233,0.25),0_15px_35px_rgba(0,0,0,0.05)] ring-1 ring-white/70 space-y-5 transition-all duration-300"
          style={{
            transform: `rotateY(${mousePos.x * 2.5}deg) rotateX(${-mousePos.y * 2.5}deg)`,
            transformStyle: 'preserve-3d',
          }}
        >
          {/* TOP GLASS SPECULAR REFLECTION HIGHLIGHT */}
          <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-white/70 via-white/20 to-transparent rounded-t-[32px] pointer-events-none"></div>

          {/* CARD HEADER */}
          <div className="relative z-10 border-b border-sky-200/50 pb-3.5">
            <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center justify-between">
              <span>{t('login.welcomeBack')}</span>
              <Sparkles className="w-4 h-4 text-sky-600 animate-pulse" />
            </h2>
            <p className="text-xs text-slate-600 font-medium mt-0.5">
              {t('login.signInPrompt')}
            </p>
          </div>

          {/* ERROR ALERT */}
          {errorMessage && (
            <div className="relative z-10 p-3.5 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-700 text-xs font-semibold flex items-center gap-2.5 backdrop-blur-md animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMessage === 'Invalid login credentials' ? t('login.invalidCredentials') : errorMessage}</span>
            </div>
          )}

          {/* FORM */}
          <form onSubmit={handleSubmit} className="relative z-10 space-y-4.5">
            
            {/* Username / Email Field */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {t('login.usernameLabel')}
              </label>
              <div className="relative group/input">
                <UserIcon className="w-4 h-4 text-sky-600/80 absolute start-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors group-focus-within/input:text-sky-600" />
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={t('login.usernameLabel')}
                  className="w-full bg-white/60 backdrop-blur-md border border-white/90 rounded-2xl ps-10 pe-4 py-3 text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white/90 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/20 transition-all duration-300 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {t('login.passwordLabel')}
              </label>
              <div className="relative group/input">
                <Lock className="w-4 h-4 text-sky-600/80 absolute start-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors group-focus-within/input:text-sky-600" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('login.passwordLabel')}
                  className="w-full bg-white/60 backdrop-blur-md border border-white/90 rounded-2xl ps-10 pe-10 py-3 text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white/90 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/20 transition-all duration-300 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute end-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center justify-between pt-0.5">
              <label className="flex items-center gap-2 text-xs font-medium text-slate-600 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded-md border-sky-300 bg-white text-sky-600 focus:ring-sky-500"
                />
                <span>{t('login.rememberMe')}</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="relative overflow-hidden w-full py-3.5 bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-extrabold text-sm rounded-2xl shadow-[0_14px_30px_rgba(2,132,199,0.35)] hover:shadow-[0_20px_45px_rgba(2,132,199,0.45)] hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2 group/btn"
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

        {/* FOOTER */}
        <p className="text-center text-[11px] font-medium text-slate-500 mt-6 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-sky-600" />
          <span>© 2026 Al Noor United Fuel Est. (مؤسسة النور المتحدة للوقود)</span>
        </p>

      </div>
    </div>
  );
};

