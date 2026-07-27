// src/shared/components/modals/ShareEventModal.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Generic "share this link as a QR code" modal.
// Reused by:
//   - user/pages/EventDetails.tsx        (public event page)
//   - user/pages/BrowseEventDetails.tsx  (authenticated event page)
//   - organizer/pages/EventDetails.tsx   (organizer event page)
//   - user/pages/Home.tsx                (static site link)
//
// Always encodes the CANONICAL /events/{slug} URL (or the bare site URL for
// Home) — never /browse-events/{slug} — since a QR code or shared link may be
// scanned by someone who isn't logged in yet.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useEffect, useRef, useState } from 'react';
import { Download, X, QrCode as QrCodeIcon } from 'lucide-react';
import { renderQrToCanvas, downloadQrCode } from '@shared/utils/qrCode';

type Accent = 'orange' | 'blue';

const ACCENT_CLASSES: Record<Accent, {
  gradient: string;
  primaryBtn: string;
  secondaryBtn: string;
  icon: string;
}> = {
  orange: {
    gradient: 'from-orange-50 to-orange-100',
    primaryBtn: 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700',
    secondaryBtn: 'border-2 border-orange-500 text-orange-600 hover:bg-orange-50',
    icon: 'text-orange-300',
  },
  blue: {
    gradient: 'from-blue-50 to-blue-100',
    primaryBtn: 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
    secondaryBtn: 'border-2 border-blue-500 text-blue-600 hover:bg-blue-50',
    icon: 'text-blue-300',
  },
};

interface ShareEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  shareUrl: string;
  downloadFilename: string;
  accent?: Accent;
}

const ShareEventModal: React.FC<ShareEventModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  shareUrl,
  downloadFilename,
  accent = 'orange',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [renderError, setRenderError] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);

  const cls = ACCENT_CLASSES[accent];

  useEffect(() => {
    if (!isOpen || !canvasRef.current) return;
    setRenderError(false);
    renderQrToCanvas(canvasRef.current, shareUrl, 240).catch(() => setRenderError(true));
  }, [isOpen, shareUrl]);

  if (!isOpen) return null;

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await downloadQrCode(shareUrl, downloadFilename);
    } catch {
      // Canvas preview is still visible as a fallback — no error banner needed
      // for what's a "nice to have" download action.
    } finally {
      setDownloading(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center">
          <h3 className="text-2xl font-bold text-gray-800 mb-1 pr-6">{title}</h3>
          {subtitle && <p className="text-gray-600 mb-2">{subtitle}</p>}

          <div className={`bg-gradient-to-br ${cls.gradient} rounded-xl p-8 mb-6 mt-4`}>
            <div className="w-60 h-60 mx-auto bg-white rounded-lg flex items-center justify-center overflow-hidden">
              {renderError ? (
                <QrCodeIcon className={`w-32 h-32 ${cls.icon}`} />
              ) : (
                <canvas ref={canvasRef} width={240} height={240} />
              )}
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="text-xs text-gray-500 mb-1">Link</div>
            <div className="font-mono text-xs font-medium text-gray-800 break-all">{shareUrl}</div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleDownload}
              disabled={downloading}
              className={`flex-1 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50 ${cls.secondaryBtn}`}
            >
              <Download className="w-4 h-4" /> Download
            </button>
            <button
              onClick={handleCopyLink}
              className={`flex-1 text-white py-3 rounded-lg font-medium transition-all ${cls.primaryBtn}`}
            >
              {copied ? 'Copied!' : 'Copy Link'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareEventModal;