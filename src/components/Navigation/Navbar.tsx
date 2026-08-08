import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  LayoutDashboard,
  PlusCircle,
  Bell,
  ShieldCheck,
  Globe,
  Building,
  LogOut,
  Menu,
  X,
} from 'lucide-react';

// DISTINCTIVE 3D / ISOMETRIC MULTI-LAYERED AUDIT ICON COMPONENT
const AuditIcon3D: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="audit3d_grad1" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
        <stop stopColor="#34D399" />
        <stop offset="1" stopColor="#059669" />
      </linearGradient>
      <linearGradient id="audit3d_grad2" x1="6" y1="6" x2="18" y2="18" gradientUnits="userSpaceOnUse">
        <stop stopColor="#6EE7B7" />
        <stop offset="1" stopColor="#10B981" />
      </linearGradient>
    </defs>
    
    {/* 3D Depth Shadow Sheet Layer */}
    <path
      d="M7 3.5C5.89543 3.5 5 4.39543 5 5.5V18.5C5 19.6046 5.89543 20.5 7 20.5H16.5C17.6046 20.5 18.5 19.6046 18.5 18.5V9.5L12.5 3.5H7Z"
      fill="#064E3B"
      opacity="0.4"
      transform="translate(0.8, 0.8)"
    />

    {/* Main Multi-Layered Document Sheet */}
    <path
      d="M6 3C4.89543 3 4 3.89543 4 5V18C4 19.1046 4.89543 20 6 20H15.5C16.6046 20 17.5 19.1046 17.5 18V9L11.5 3H6Z"
      fill="url(#audit3d_grad1)"
    />

    {/* 3D Folded Top Corner Flap */}
    <path
      d="M11.5 3V8.5H17.5L11.5 3Z"
      fill="url(#audit3d_grad2)"
    />

    {/* Document Content Lines */}
    <rect x="6.5" y="9" width="4.5" height="1.4" rx="0.7" fill="#E6F4EA" opacity="0.95" />
    <rect x="6.5" y="12" width="7.5" height="1.4" rx="0.7" fill="#E6F4EA" opacity="0.95" />
    <rect x="6.5" y="15" width="5" height="1.4" rx="0.7" fill="#E6F4EA" opacity="0.95" />

    {/* 3D Checkmark Emblem Badge */}
    <circle cx="16" cy="16" r="4" fill="#047857" stroke="#A7F3D0" strokeWidth="1" />
    <path
      d="M14.2 16L15.4 17.2L17.8 14.8"
      stroke="#FFFFFF"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

interface Props {
  activeTab: 'dashboard' | 'audits' | 'new-audit' | 'activity' | 'admin';
  setActiveTab: (tab: 'dashboard' | 'audits' | 'new-audit' | 'activity' | 'admin') => void;
  unreadCount: number;
  activeModule?: 'audits' | 'station-openings';
  onSelectModule?: (module: 'audits' | 'station-openings') => void;
}

export const Navbar: React.FC<Props> = ({
  activeTab,
  setActiveTab,
  unreadCount,
  activeModule = 'audits',
  onSelectModule,
}) => {
  const { currentUser, logout, canCreateAudit } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  if (!currentUser) return null;

  const isSuperAdmin = currentUser.role === 'Super Admin';
  const isStationOpeningUser = [
    'Head of Operation',
    'Safety & Quality Control',
    'Document Controller',
    'Engineering Department',
    'Al Noor United Management',
  ].includes(currentUser.role);

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ar' : 'en');
  };

  const handleMobileNavClick = (tab: 'dashboard' | 'audits' | 'new-audit' | 'activity' | 'admin') => {
    setActiveTab(tab);
    setIsMobileDrawerOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-40 glass-header">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            
            {/* BRANDING LOGO & TITLE */}
            <div
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => setActiveTab(isSuperAdmin ? 'admin' : 'dashboard')}
            >
              <div className="transition-transform group-hover:scale-105 w-9 h-9 sm:w-10 sm:h-10 shrink-0 flex items-center justify-center">
                <img
                  src="/flower_emblem.png"
                  alt="Al Noor United Flower Emblem"
                  className="w-full h-full object-contain animate-spin-slow"
                />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h1 className="font-extrabold text-white text-xs sm:text-sm tracking-tight drop-shadow-sm">
                    {t('nav.logoTitle')}
                  </h1>
                  <span className="hidden sm:inline-block text-[10px] bg-sky-400/20 text-sky-200 font-bold px-2 py-0.5 rounded-full border border-sky-400/30">
                    {t('nav.logoSub')}
                  </span>
                </div>
                <p className="text-[9px] sm:text-[10px] text-sky-200/90 font-semibold leading-tight drop-shadow-sm">
                  مؤسسة النور المتحدة للوقود
                </p>
              </div>
            </div>

            {/* DESKTOP NAVIGATION TABS WITH COLORED MICRO-BADGES */}
            <nav className="hidden md:flex items-center gap-1 sm:gap-2">
              {/* ENTERPRISE MODULE SWITCHER SEGMENTED CONTROL (SUPER ADMIN ONLY) */}
              {isSuperAdmin && (
                <div className="flex items-center p-1 bg-white/10 backdrop-blur-2xl border border-white/20 rounded-2xl shadow-inner me-2">
                  <button
                    onClick={() => onSelectModule?.('audits')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                      activeModule === 'audits'
                        ? 'bg-gradient-to-r from-sky-600 to-blue-600 text-white shadow-md shadow-sky-600/25 ring-1 ring-sky-400/30'
                        : 'text-sky-100 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <AuditIcon3D className="w-4 h-4" />
                    <span>Station Audit System</span>
                  </button>

                  <button
                    onClick={() => onSelectModule?.('station-openings')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                      activeModule === 'station-openings'
                        ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-md shadow-amber-600/25 ring-1 ring-amber-400/30'
                        : 'text-sky-100 hover:text-white hover:bg-white/15'
                    }`}
                  >
                    <Building className="w-3.5 h-3.5" />
                    <span>Station Opening Form</span>
                  </button>
                </div>
              )}

              {/* SUPER ADMIN SUITE TAB */}
              {isSuperAdmin && (
                <button
                  onClick={() => setActiveTab('admin')}
                  className={`group flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                    activeTab === 'admin'
                      ? 'bg-purple-500/30 text-purple-100 border border-purple-400/40 shadow-sm ring-1 ring-purple-400/40'
                      : 'bg-purple-500/10 text-purple-200 border border-purple-400/20 hover:bg-purple-500/20 hover:text-white'
                  }`}
                >
                  <div className="p-1 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-400/30 group-hover:scale-110 transition-transform">
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </div>
                  <span>{t('nav.adminHub')}</span>
                </button>
              )}

              {/* STATION AUDIT SYSTEM TABS (HIDDEN FOR STATION OPENING ACCOUNTS) */}
              {!isStationOpeningUser && (
                <>
                  {/* 1. DASHBOARD: SOFT INDIGO / CYAN MICRO-BADGE */}
                  <button
                    onClick={() => setActiveTab('dashboard')}
                    className={`group flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                      activeTab === 'dashboard'
                        ? 'bg-indigo-500/30 text-white border border-indigo-400/40 shadow-sm ring-1 ring-cyan-400/30'
                        : 'text-sky-100 hover:text-white hover:bg-white/15'
                    }`}
                  >
                    <div className="p-1 rounded-lg bg-indigo-500/20 text-cyan-300 border border-indigo-400/30 group-hover:scale-110 transition-transform">
                      <LayoutDashboard className="w-3.5 h-3.5" />
                    </div>
                    <span>{t('nav.dashboard')}</span>
                  </button>

                  {/* 2. AUDITS: SOFT TEAL / EMERALD MICRO-BADGE & 3D ISOMETRIC ICON */}
                  <button
                    onClick={() => setActiveTab('audits')}
                    className={`group flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                      activeTab === 'audits'
                        ? 'bg-emerald-500/30 text-white border border-emerald-400/40 shadow-sm ring-1 ring-emerald-400/30'
                        : 'text-sky-100 hover:text-white hover:bg-white/15'
                    }`}
                  >
                    <div className="p-1 rounded-lg bg-teal-500/20 border border-teal-400/30 group-hover:scale-110 transition-transform flex items-center justify-center">
                      <AuditIcon3D className="w-4 h-4" />
                    </div>
                    <span>{t('nav.audits')}</span>
                  </button>

                  {/* 3. NEW AUDIT: VIBRANT ELECTRIC BLUE */}
                  {canCreateAudit && (
                    <button
                      onClick={() => setActiveTab('new-audit')}
                      className={`group flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-black transition-all ${
                        activeTab === 'new-audit'
                          ? 'bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 text-white shadow-md shadow-sky-600/30 ring-2 ring-sky-400/50'
                          : 'bg-gradient-to-r from-sky-600/90 to-blue-600/90 text-white border border-sky-300/40 hover:from-sky-500 hover:to-blue-500 hover:scale-[1.03] shadow-sm'
                      }`}
                    >
                      <div className="p-0.5 rounded-lg bg-white/20 text-white group-hover:scale-110 transition-transform">
                        <PlusCircle className="w-3.5 h-3.5" />
                      </div>
                      <span>{t('nav.newAudit')}</span>
                    </button>
                  )}

                  {/* 4. ACTIVITY: SOFT AMBER / ORANGE MICRO-BADGE */}
                  <button
                    onClick={() => setActiveTab('activity')}
                    className={`group relative flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                      activeTab === 'activity'
                        ? 'bg-amber-500/30 text-white border border-amber-400/40 shadow-sm ring-1 ring-amber-400/30'
                        : 'text-sky-100 hover:text-white hover:bg-white/15'
                    }`}
                  >
                    <div className="p-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-400/30 group-hover:scale-110 transition-transform">
                      <Bell className="w-3.5 h-3.5" />
                    </div>
                    <span>{t('nav.activity')}</span>
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center shadow-md ring-2 ring-slate-900">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                </>
              )}
            </nav>

            {/* USER PROFILE, LANGUAGE SWITCHER & MOBILE DRAWER TRIGGER */}
            <div className="flex items-center gap-2 sm:gap-3 relative">

              {/* LANGUAGE SWITCHER TOGGLE BUTTON */}
              <button
                onClick={toggleLanguage}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/30 bg-white/15 hover:bg-white/25 text-white font-extrabold text-xs transition-all shadow-sm min-h-[40px]"
                title="Switch Language / تغيير اللغة"
              >
                <Globe className="w-4 h-4 text-sky-300" />
                <span>{language === 'en' ? 'العربية' : 'English'}</span>
              </button>

              {/* User Profile Card */}
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl border border-white/30 bg-white/15 hover:bg-white/25 transition-all text-left shadow-sm min-h-[40px]"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-sky-500 via-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-xs border border-white/40 shadow-sm shrink-0">
                    {currentUser.full_name.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="hidden sm:block">
                    <p className="text-xs font-extrabold text-white leading-tight drop-shadow-sm">
                      {currentUser.full_name}
                    </p>
                    <p className="text-[10px] text-sky-200 font-bold leading-none mt-0.5">
                      {currentUser.role}
                    </p>
                  </div>
                </button>

                {/* User Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white/90 backdrop-blur-2xl border border-white/90 rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in duration-150 ring-1 ring-black/5">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs font-extrabold text-slate-900">{currentUser.full_name}</p>
                      <p className="text-[10px] text-slate-500 font-mono">{currentUser.email}</p>
                      <span className="inline-block mt-1 text-[9px] px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-700 font-bold border border-sky-500/20">
                        {currentUser.role}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        toggleLanguage();
                      }}
                      className="w-full px-4 py-2 text-start text-xs font-bold text-slate-700 hover:bg-sky-50 hover:text-sky-800 flex items-center gap-2 transition-colors"
                    >
                      <Globe className="w-4 h-4 text-sky-600" />
                      <span>{t('nav.language')}: <strong className="text-sky-700">{language === 'en' ? 'English' : 'العربية'}</strong></span>
                    </button>

                    {isSuperAdmin && (
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          setActiveTab('admin');
                        }}
                        className="w-full px-4 py-2 text-start text-xs text-purple-700 hover:bg-purple-50 flex items-center gap-2 transition-colors font-extrabold"
                      >
                        <ShieldCheck className="w-4 h-4 text-purple-600" />
                        <span>{t('nav.adminHub')}</span>
                      </button>
                    )}

                    <div className="border-t border-slate-100 mt-1 pt-1">
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          logout();
                        }}
                        className="w-full px-4 py-2 text-start text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors font-extrabold"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>{t('nav.signOut')}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* MOBILE HAMBURGER MENU BUTTON */}
              <button
                onClick={() => setIsMobileDrawerOpen(!isMobileDrawerOpen)}
                className="md:hidden p-2 rounded-xl bg-sky-500/10 text-sky-700 border border-sky-500/20 hover:bg-sky-500/20 transition-all min-h-[40px] min-w-[40px] flex items-center justify-center"
                aria-label="Toggle Navigation Drawer"
              >
                {isMobileDrawerOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>

            </div>


          </div>
        </div>

        {/* MOBILE NAVIGATION DRAWER */}
        {isMobileDrawerOpen && (
          <div className="md:hidden bg-white/95 backdrop-blur-2xl border-b border-sky-100 px-4 py-3 shadow-xl animate-in slide-in-from-top duration-200">
            <div className="flex flex-col space-y-2">

              {/* MOBILE MODULE SWITCHER (SUPER ADMIN ONLY) */}
              {isSuperAdmin && (
                <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 border border-slate-200 rounded-xl mb-2">
                  <button
                    onClick={() => {
                      onSelectModule?.('audits');
                      setIsMobileDrawerOpen(false);
                    }}
                    className={`py-2 text-center text-xs font-black rounded-lg transition-all ${
                      activeModule === 'audits'
                        ? 'bg-sky-600 text-white shadow-sm'
                        : 'text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    Station Audit
                  </button>
                  <button
                    onClick={() => {
                      onSelectModule?.('station-openings');
                      setIsMobileDrawerOpen(false);
                    }}
                    className={`py-2 text-center text-xs font-black rounded-lg transition-all ${
                      activeModule === 'station-openings'
                        ? 'bg-amber-600 text-white shadow-sm'
                        : 'text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    Station Opening Form
                  </button>
                </div>
              )}
              {isSuperAdmin && (
                <button
                  onClick={() => handleMobileNavClick('admin')}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                    activeTab === 'admin'
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'text-purple-700 bg-purple-50 hover:bg-purple-100'
                  }`}
                >
                  <ShieldCheck className="w-5 h-5" />
                  <span>{t('nav.adminHub')}</span>
                </button>
              )}

              <button
                onClick={() => handleMobileNavClick('dashboard')}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'dashboard'
                    ? 'bg-sky-600 text-white shadow-md'
                    : 'text-slate-700 hover:bg-sky-50'
                }`}
              >
                <div className="p-1.5 rounded-lg bg-indigo-100 text-indigo-700 border border-indigo-200">
                  <LayoutDashboard className="w-4 h-4" />
                </div>
                <span>{t('nav.dashboard')}</span>
              </button>

              <button
                onClick={() => handleMobileNavClick('audits')}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'audits'
                    ? 'bg-sky-600 text-white shadow-md'
                    : 'text-slate-700 hover:bg-sky-50'
                }`}
              >
                <div className="p-1 rounded-lg bg-teal-100 text-emerald-700 border border-teal-200 flex items-center justify-center">
                  <AuditIcon3D className="w-5 h-5" />
                </div>
                <span>{t('nav.audits')}</span>
              </button>

              {canCreateAudit && (
                <button
                  onClick={() => handleMobileNavClick('new-audit')}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-extrabold transition-all ${
                    activeTab === 'new-audit'
                      ? 'bg-gradient-to-r from-sky-600 to-indigo-600 text-white shadow-md'
                      : 'bg-sky-500/10 text-sky-700 hover:bg-sky-500/20'
                  }`}
                >
                  <div className="p-1.5 rounded-lg bg-sky-600 text-white shadow-2xs">
                    <PlusCircle className="w-4 h-4" />
                  </div>
                  <span>{t('nav.newAudit')}</span>
                </button>
              )}

              <button
                onClick={() => handleMobileNavClick('activity')}
                className={`flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'activity'
                    ? 'bg-sky-600 text-white shadow-md'
                    : 'text-slate-700 hover:bg-sky-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5" />
                  <span>{t('nav.activity')}</span>
                </div>
                {unreadCount > 0 && (
                  <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </button>

              <button
                onClick={toggleLanguage}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold text-sky-800 bg-sky-50 border border-sky-200 transition-all"
              >
                <Globe className="w-5 h-5 text-sky-600" />
                <span>{t('nav.language')}: {language === 'en' ? 'العربية' : 'English'}</span>
              </button>
            </div>
          </div>
        )}
      </header>
    </>
  );
};
