import React, { useState, useRef, useEffect, useCallback } from 'react';
import { PenTool, RotateCcw, Send, X, Loader2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface Props {
  isOpen: boolean;
  title: string;
  signatoryName: string;
  signatoryRole: string;
  onSaveSignature: (signatureDataUrl: string, editedSignatoryName?: string) => Promise<void> | void;
  onClose: () => void;
}

export const SignaturePadModal: React.FC<Props> = ({
  isOpen,
  title,
  signatoryName,
  signatoryRole,
  onSaveSignature,
  onClose,
}) => {
  const { t } = useLanguage();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);

  const [currentSignatoryName, setCurrentSignatoryName] = useState(signatoryName || '');
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hasDrawnRef = useRef(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);

  const markAsDrawn = useCallback(() => {
    hasDrawnRef.current = true;
    setHasDrawn(true);
    if (overlayRef.current) {
      overlayRef.current.style.display = 'none';
    }
  }, []);

  // Initialize and resize canvas with High-DPI support
  const setupCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const dpr = Math.max(window.devicePixelRatio || 1, 2);

    // Save existing image before resize if already drawn
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext('2d');
    if (tempCtx && canvas.width > 0 && canvas.height > 0) {
      tempCtx.drawImage(canvas, 0, 0);
    }

    canvas.width = Math.floor(rect.width * dpr);
    canvas.height = Math.floor(rect.height * dpr);

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.lineWidth = 3 * dpr;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = '#0f172a'; // Deep slate ink

      if (tempCanvas.width > 0 && tempCanvas.height > 0 && hasDrawnRef.current) {
        ctx.drawImage(tempCanvas, 0, 0, canvas.width, canvas.height);
      }
    }
  }, []);

  // Handle modal open & canvas setup
  useEffect(() => {
    if (isOpen) {
      setCurrentSignatoryName(signatoryName || '');
      setIsSubmitting(false);

      const timer = setTimeout(() => {
        setupCanvas();
        clearCanvas();
      }, 100);

      window.addEventListener('resize', setupCanvas);
      return () => {
        clearTimeout(timer);
        window.removeEventListener('resize', setupCanvas);
      };
    }
  }, [isOpen, signatoryName, setupCanvas]);

  // Extract precise touch/mouse/pointer coordinates relative to internal canvas resolution
  const getCanvasCoords = (e: MouseEvent | TouchEvent | PointerEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0, dpr: 1 };

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

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
      dpr: Math.max(window.devicePixelRatio || 1, 2),
    };
  };

  // Native touch event handlers with passive: false to lock Android page scrolling & zoom
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !isOpen) return;

    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      if (isSubmitting) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      markAsDrawn();
      const coords = getCanvasCoords(e);
      setIsDrawing(true);
      lastPointRef.current = coords;

      ctx.beginPath();
      ctx.moveTo(coords.x, coords.y);
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      if (!isDrawing || isSubmitting) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      markAsDrawn();
      const coords = getCanvasCoords(e);
      const lastPoint = lastPointRef.current || coords;

      // Midpoint curve interpolation for silky smooth ink rendering
      const midX = (lastPoint.x + coords.x) / 2;
      const midY = (lastPoint.y + coords.y) / 2;

      ctx.lineWidth = 3 * coords.dpr;
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
    };

    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd, { passive: false });
    canvas.addEventListener('touchcancel', handleTouchEnd, { passive: false });

    return () => {
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleTouchEnd);
      canvas.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [isOpen, isDrawing, isSubmitting, markAsDrawn]);

  // Mouse / Pointer handlers for desktop & stylus
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isSubmitting) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    markAsDrawn();
    const coords = getCanvasCoords(e.nativeEvent);
    setIsDrawing(true);
    lastPointRef.current = coords;

    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || isSubmitting) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    markAsDrawn();
    const coords = getCanvasCoords(e.nativeEvent);
    const lastPoint = lastPointRef.current || coords;

    const midX = (lastPoint.x + coords.x) / 2;
    const midY = (lastPoint.y + coords.y) / 2;

    ctx.lineWidth = 3 * coords.dpr;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#0f172a';

    ctx.quadraticCurveTo(lastPoint.x, lastPoint.y, midX, midY);
    ctx.stroke();

    lastPointRef.current = coords;
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
    lastPointRef.current = null;
  };

  const clearCanvas = () => {
    if (isSubmitting) return;
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
    hasDrawnRef.current = false;
    setHasDrawn(false);
    lastPointRef.current = null;
    if (overlayRef.current) {
      overlayRef.current.style.display = 'flex';
    }
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    const canvas = canvasRef.current;
    if (!canvas || (!hasDrawn && !hasDrawnRef.current)) {
      alert('Please draw your handwritten signature on the canvas before submitting.');
      return;
    }

    const finalName = currentSignatoryName.trim() || signatoryName;

    setIsSubmitting(true);
    try {
      const signatureDataUrl = canvas.toDataURL('image/png');
      await onSaveSignature(signatureDataUrl, finalName);
      onClose();
    } catch (e: any) {
      alert(`Signature submission failed: ${e.message || 'Error saving signature'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-md p-3 sm:p-4">
      <div className="bg-white/95 backdrop-blur-2xl border border-white/90 rounded-[28px] max-w-lg w-full p-5 sm:p-6 shadow-2xl ring-1 ring-white/60 animate-in fade-in zoom-in-95 duration-200">
        
        {/* MODAL HEADER */}
        <div className="flex items-center justify-between pb-3.5 border-b border-sky-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 rounded-2xl text-white shadow-md">
              <PenTool className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">{title}</h3>
              <p className="text-xs text-sky-700 font-extrabold">{signatoryRole}</p>
            </div>
          </div>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors disabled:opacity-50 min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* EDITABLE SIGNATORY NAME INPUT */}
        <div className="mt-3 mb-3">
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Signatory Full Name <span className="text-sky-600 font-semibold">(Editable)</span>
          </label>
          <input
            type="text"
            value={currentSignatoryName}
            onChange={(e) => setCurrentSignatoryName(e.target.value)}
            placeholder="Enter supervisor / signatory full name..."
            className="w-full bg-white border border-sky-200 rounded-xl px-3.5 py-2.5 text-xs font-extrabold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-500/15 shadow-sm min-h-[44px]"
          />
        </div>

        {/* INSTRUCTIONS */}
        <div className="mb-3 text-xs text-slate-600 font-medium leading-relaxed">
          Draw your handwritten signature below using your finger or stylus. Page scrolling is automatically locked while signing.
        </div>

        {/* CANVAS PAD */}
        <div className="relative mb-4">
          <canvas
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            className={`w-full h-52 sm:h-56 bg-white rounded-2xl border-2 border-dashed border-sky-300 cursor-crosshair shadow-inner ${
              isSubmitting ? 'pointer-events-none opacity-80' : ''
            }`}
            style={{ touchAction: 'none' }}
          />
          <div
            ref={overlayRef}
            className={`absolute inset-0 flex items-center justify-center pointer-events-none text-slate-400 text-xs italic font-semibold select-none p-4 text-center ${
              hasDrawn ? 'hidden' : ''
            }`}
          >
            {t('signatureModal.instruction')}
          </div>
        </div>

        {/* CONTROLS & BUTTONS */}
        <div className="flex items-center justify-between border-t border-sky-100 pt-3.5">
          <button
            type="button"
            disabled={isSubmitting || (!hasDrawn && !hasDrawnRef.current)}
            onClick={clearCanvas}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-rose-600 font-extrabold text-xs rounded-xl flex items-center gap-1.5 transition-colors disabled:opacity-50 min-h-[44px]"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{t('signatureModal.clear')}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors disabled:opacity-50 min-h-[44px]"
            >
              {t('common.cancel')}
            </button>
            <button
              type="button"
              disabled={isSubmitting || (!hasDrawn && !hasDrawnRef.current)}
              onClick={handleSubmit}
              className="px-5 py-2.5 bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-sky-600/30 transition-all flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{t('common.loading')}</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 rtl:rotate-180" />
                  <span>{t('signatureModal.saveSignature')}</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
