import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { updateUserPassword } from '../../lib/supabaseClient';
import { User, X, ShieldCheck, PenTool, Lock } from 'lucide-react';


interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const UserProfileModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { currentUser, updateProfile } = useAuth();

  const [activeTab, setActiveTab] = useState<'profile' | 'signature' | 'password'>('profile');


  // Contact fields
  const [mobileNumber, setMobileNumber] = useState(currentUser?.mobile_number || '');
  const [signatureUrl, setSignatureUrl] = useState(currentUser?.signature_url || '');
  
  // Password fields
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Digital Signature Canvas Drawing State
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  if (!isOpen || !currentUser) return null;


  // Handle Profile Update
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    await updateProfile({
      mobile_number: mobileNumber,
      signature_url: signatureUrl,
    });

    setMessage({ type: 'success', text: 'User profile and signature updated successfully.' });
  };

  // Handle Change Password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (newPass !== confirmPass) {
      setMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    if (newPass.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters long.' });
      return;
    }

    const res = await updateUserPassword(currentUser.id, currentUser.email, newPass);
    if (!res.success && res.error) {
      setMessage({ type: 'error', text: `Failed to update password: ${res.error}` });
      return;
    }

    await updateProfile({ password_hash: '' });
    setNewPass('');
    setConfirmPass('');
    setMessage({ type: 'success', text: 'Password updated successfully in Supabase Authentication.' });
  };

  const lastPointRef = useRef<{ x: number; y: number } | null>(null);

  // Extract precise touch/mouse/pointer coordinates relative to CSS canvas box
  const getCanvasCoords = (e: MouseEvent | TouchEvent | PointerEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    let clientX = 0;
    let clientY = 0;

    if ('touches' in e && e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if ('changedTouches' in e && e.changedTouches && e.changedTouches.length > 0) {
      clientX = e.changedTouches[0].clientX;
      clientY = e.changedTouches[0].clientY;
    } else if ('clientX' in e) {
      clientX = (e as MouseEvent).clientX;
      clientY = (e as MouseEvent).clientY;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  // Native touch event listeners with passive: false to lock Android scrolling
  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || activeTab !== 'signature') return;

    const rect = canvas.getBoundingClientRect();
    const dpr = Math.max(window.devicePixelRatio || 1, 2);
    if (rect.width > 0 && rect.height > 0 && canvas.width !== rect.width * dpr) {
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(dpr, dpr);
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = '#0f172a';
      }
    }

    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const coords = getCanvasCoords(e);
      setIsDrawing(true);
      lastPointRef.current = coords;

      ctx.beginPath();
      ctx.moveTo(coords.x, coords.y);
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      if (!isDrawing) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const coords = getCanvasCoords(e);
      const lastPoint = lastPointRef.current || coords;

      const midX = (lastPoint.x + coords.x) / 2;
      const midY = (lastPoint.y + coords.y) / 2;

      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = '#0f172a';

      ctx.quadraticCurveTo(lastPoint.x, lastPoint.y, midX, midY);
      ctx.stroke();

      lastPointRef.current = coords;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      e.preventDefault();
      setIsDrawing(false);
      lastPointRef.current = null;
      if (canvas) {
        setSignatureUrl(canvas.toDataURL('image/png'));
      }
    };

    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd, { passive: false });

    return () => {
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleTouchEnd);
    };
  }, [activeTab, isDrawing]);

  // Mouse Handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    const coords = getCanvasCoords(e.nativeEvent);
    lastPointRef.current = coords;

    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const coords = getCanvasCoords(e.nativeEvent);
    const lastPoint = lastPointRef.current || coords;

    const midX = (lastPoint.x + coords.x) / 2;
    const midY = (lastPoint.y + coords.y) / 2;

    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#0f172a';

    ctx.quadraticCurveTo(lastPoint.x, lastPoint.y, midX, midY);
    ctx.stroke();

    lastPointRef.current = coords;
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    lastPointRef.current = null;
    const canvas = canvasRef.current;
    if (canvas) {
      setSignatureUrl(canvas.toDataURL('image/png'));
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
    setSignatureUrl('');
    lastPointRef.current = null;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4">
      <div className="bg-white/85 backdrop-blur-2xl border border-white/90 rounded-[28px] max-w-2xl w-full p-6 shadow-2xl ring-1 ring-white/60 animate-in fade-in zoom-in-95 duration-200">
        
        {/* MODAL HEADER */}
        <div className="flex items-center justify-between pb-4 border-b border-sky-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 rounded-2xl text-white shadow-md">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">{currentUser.full_name}</h3>
              <p className="text-xs text-sky-700 font-extrabold">{currentUser.position} • {currentUser.employee_id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* TABS */}
        <div className="flex items-center gap-2 border-b border-sky-100 my-4 text-xs font-extrabold">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 border-b-2 transition-all ${
              activeTab === 'profile'
                ? 'border-sky-600 text-sky-700 font-black'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            User Details
          </button>
          <button
            onClick={() => setActiveTab('signature')}
            className={`px-4 py-2 border-b-2 transition-all ${
              activeTab === 'signature'
                ? 'border-sky-600 text-sky-700 font-black'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Digital Signature
          </button>
          <button
            onClick={() => setActiveTab('password')}
            className={`px-4 py-2 border-b-2 transition-all ${
              activeTab === 'password'
                ? 'border-sky-600 text-sky-700 font-black'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Security & Password
          </button>
        </div>

        {/* MESSAGE ALERT */}
        {message && (
          <div
            className={`p-3.5 rounded-xl text-xs font-bold mb-4 ${
              message.type === 'success'
                ? 'bg-emerald-500/10 text-emerald-700 border border-emerald-500/30'
                : 'bg-rose-500/10 text-rose-700 border border-rose-500/30'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* TAB 1: PROFILE DETAILS */}
        {activeTab === 'profile' && (
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Full Name</label>
                <input
                  type="text"
                  disabled
                  value={currentUser.full_name}
                  className="w-full bg-slate-100/80 border border-sky-100 rounded-xl p-2.5 text-slate-900 font-extrabold"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Employee ID</label>
                <input
                  type="text"
                  disabled
                  value={currentUser.employee_id}
                  className="w-full bg-slate-100/80 border border-sky-100 rounded-xl p-2.5 text-sky-700 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Email</label>
                <input
                  type="text"
                  disabled
                  value={currentUser.email}
                  className="w-full bg-slate-100/80 border border-sky-100 rounded-xl p-2.5 text-slate-900 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Assigned Role</label>
                <span className="inline-block px-3 py-1.5 rounded-xl bg-purple-500/10 text-purple-700 font-extrabold border border-purple-500/20">
                  {currentUser.role}
                </span>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Position</label>
                <input
                  type="text"
                  disabled
                  value={currentUser.position}
                  className="w-full bg-slate-100/80 border border-sky-100 rounded-xl p-2.5 text-slate-900 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Mobile Number</label>
                <input
                  type="text"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  className="w-full bg-white border border-sky-200 rounded-xl p-2.5 text-slate-900 font-medium focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-sky-100 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-sky-600/30 transition-all"
              >
                Save Profile Changes
              </button>
            </div>
          </form>
        )}

        {/* TAB 2: DIGITAL SIGNATURE */}
        {activeTab === 'signature' && (
          <div className="space-y-4">
            <p className="text-xs text-slate-600 font-medium">
              Draw your digital signature below or auto-generate a digital seal. This signature will be embedded into all audit approvals and PDF exports.
            </p>

            {/* Signature Preview */}
            <div className="bg-white p-4 rounded-2xl border border-sky-200 text-center relative shadow-sm">
              {signatureUrl ? (
                <img
                  src={signatureUrl}
                  alt="Digital Signature"
                  className="h-16 max-w-full mx-auto object-contain"
                />
              ) : (
                <p className="text-xs text-slate-400 italic py-4">No digital signature uploaded yet.</p>
              )}
            </div>

            {/* Drawing Canvas */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-bold text-slate-900 flex items-center gap-1.5">
                  <PenTool className="w-3.5 h-3.5 text-sky-600" />
                  <span>Signature Canvas</span>
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={clearCanvas}
                    className="text-rose-600 hover:text-rose-700 font-bold"
                  >
                    Clear Canvas
                  </button>
                </div>
              </div>

              <canvas
                ref={canvasRef}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                className="w-full h-36 bg-white rounded-2xl border-2 border-dashed border-sky-300 cursor-crosshair shadow-inner"
                style={{ touchAction: 'none' }}
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={handleSaveProfile}
                className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-1.5"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Save Digital Signature</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: PASSWORD */}
        {activeTab === 'password' && (
          <form onSubmit={handleChangePassword} className="space-y-4 max-w-md mx-auto">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                New Password
              </label>
              <input
                type="password"
                required
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                className="w-full bg-white border border-sky-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                value={confirmPass}
                onChange={(e) => setConfirmPass(e.target.value)}
                className="w-full bg-white border border-sky-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-sky-600/30 transition-all flex items-center gap-1.5"
              >
                <Lock className="w-4 h-4" />
                <span>Update Password</span>
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
