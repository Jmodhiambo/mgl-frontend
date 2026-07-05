// src/shared/pages/CheckInPage.tsx
//
// Shared gate-scanning UI used by both the organizer and admin portals.
// Import and render with the correct endpoints for each context:
//
//   Organizer:
//     <CheckInPage
//       qrEndpoint="/organizers/me/check-in"
//       codeEndpoint="/organizers/me/check-in/by-code"
//       eventsFetcher={() => getOrganizerEvents()}
//     />
//
//   Admin:
//     <CheckInPage
//       qrEndpoint="/admin/check-in"
//       codeEndpoint="/admin/check-in/by-code"
//       eventsFetcher={() => getAllEvents()}
//     />
//

import React, { useEffect, useRef, useState, useCallback } from 'react';
import jsQR from 'jsqr';
import {
  Camera, CheckCircle, XCircle, AlertCircle,
  RotateCcw, Keyboard, Calendar, ChevronDown,
} from 'lucide-react';
import { checkInByQr, checkInByCode, type CheckInResponse } from '@shared/api/checkInService';

// ── Types ──────────────────────────────────────────────────────────────────

interface EventOption {
  id: number;
  title: string;
}

interface CheckInPageProps {
  /** POST endpoint for QR payload scanning, e.g. '/organizers/me/check-in' */
  qrEndpoint: string;
  /** POST endpoint for manual code entry, e.g. '/organizers/me/check-in/by-code' */
  codeEndpoint: string;
  /** Async function that fetches the list of events this user can scan for */
  eventsFetcher: () => Promise<EventOption[]>;
  /** Accent colour class for the top bar — 'bg-blue-600' for organizer,
   *  'bg-purple-700' for admin */
  accentClass?: string;
}

type ScannerState = 'idle' | 'scanning' | 'processing' | 'result';
type ScanMode = 'camera' | 'code';

const RESULT_DISPLAY_MS = 2800;

// ── Component ──────────────────────────────────────────────────────────────

const CheckInPage: React.FC<CheckInPageProps> = ({
  qrEndpoint,
  codeEndpoint,
  eventsFetcher,
  accentClass = 'bg-blue-600',
}) => {
  // Event selection
  const [events, setEvents]             = useState<EventOption[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<EventOption | null>(null);

  // Scanner state
  const [mode, setMode]               = useState<ScanMode>('camera');
  const [scannerState, setScannerState] = useState<ScannerState>('idle');
  const [result, setResult]           = useState<CheckInResponse | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [manualCode, setManualCode]   = useState('');
  const [codeError, setCodeError]     = useState<string | null>(null);

  // Camera refs
  const videoRef  = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef    = useRef<number | null>(null);
  const inFlightPayload = useRef<string | null>(null);

  // Hardware scanner: hidden input that auto-focuses in camera mode so a
  // USB/Bluetooth scanner (which behaves like a keyboard) types the decoded
  // QR string and submits it via Enter — identical to the camera path.
  const hardwareScannerInputRef = useRef<HTMLInputElement>(null);

  // ── Load events ─────────────────────────────────────────────────────────

  useEffect(() => {
    eventsFetcher()
      .then(data => {
        setEvents(data);
        if (data.length === 1) setSelectedEvent(data[0]);
      })
      .catch(() => {/* silently ignore — UI shows empty state */})
      .finally(() => setEventsLoading(false));
  }, [eventsFetcher]);

  // ── Camera lifecycle ─────────────────────────────────────────────────────

  const startCamera = useCallback(async () => {
    if (!selectedEvent) return;
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setScannerState('scanning');
      // Focus hardware scanner input once camera is live
      hardwareScannerInputRef.current?.focus();
    } catch {
      setCameraError('Could not access the camera. Please grant camera permission and try again.');
      setScannerState('idle');
    }
  }, [selectedEvent]);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
  }, []);

  useEffect(() => {
    if (mode === 'camera' && selectedEvent) {
      startCamera();
    } else {
      stopCamera();
      setScannerState('idle');
    }
    return () => stopCamera();
  }, [mode, selectedEvent, startCamera, stopCamera]);

  // ── Check-in submission ──────────────────────────────────────────────────

  const submitQr = useCallback(async (payload: string) => {
    if (!selectedEvent || scannerState !== 'scanning') return;
    setScannerState('processing');
    try {
      const res = await checkInByQr(payload, selectedEvent.id, qrEndpoint);
      setResult(res);
    } catch {
      setResult({ accepted: false, reason: 'not_found', ticket: null, first_used_at: null });
    } finally {
      setScannerState('result');
      setTimeout(() => {
        inFlightPayload.current = null;
        setResult(null);
        setScannerState('scanning');
        hardwareScannerInputRef.current?.focus();
      }, RESULT_DISPLAY_MS);
    }
  }, [selectedEvent, scannerState, qrEndpoint]);

  const submitCode = useCallback(async () => {
    const code = manualCode.trim().toUpperCase();
    if (!code || !selectedEvent) return;
    setCodeError(null);
    setScannerState('processing');
    try {
      const res = await checkInByCode(code, selectedEvent.id, codeEndpoint);
      setResult(res);
      if (res.accepted) setManualCode('');
    } catch {
      setResult({ accepted: false, reason: 'not_found', ticket: null, first_used_at: null });
    } finally {
      setScannerState('result');
      setTimeout(() => {
        setResult(null);
        setScannerState('idle');
      }, RESULT_DISPLAY_MS);
    }
  }, [manualCode, selectedEvent, codeEndpoint]);

  // ── Camera scan loop ─────────────────────────────────────────────────────

  const tick = useCallback(() => {
    const video  = videoRef.current;
    const canvas = canvasRef.current;

    if (scannerState === 'scanning' && video && canvas
        && video.readyState === video.HAVE_ENOUGH_DATA) {
      canvas.width  = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const decoded = jsQR(img.data, img.width, img.height);
        if (decoded?.data && inFlightPayload.current !== decoded.data) {
          inFlightPayload.current = decoded.data;
          submitQr(decoded.data);
        }
      }
    }

    rafRef.current = requestAnimationFrame(tick);
  }, [scannerState, submitQr]);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [tick]);

  // ── Hardware scanner input handler ───────────────────────────────────────
  // USB/BT scanners "type" the decoded string and press Enter. We capture
  // that here and route it through the same submitQr path as the camera.

  const hardwareScannerValue = useRef('');

  const handleHardwareScannerInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      hardwareScannerValue.current = e.target.value;
    }, []
  );

  const handleHardwareScannerKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        const val = hardwareScannerValue.current.trim();
        if (val && inFlightPayload.current !== val) {
          inFlightPayload.current = val;
          submitQr(val);
        }
        hardwareScannerValue.current = '';
        (e.target as HTMLInputElement).value = '';
      }
    }, [submitQr]
  );

  // ── Result display helpers ───────────────────────────────────────────────

  const reasonLabel: Record<string, string> = {
    already_used:      'Already scanned',
    cancelled:          'Ticket cancelled',
    not_found:          'Ticket not found',
    invalid_signature:  'Invalid QR code',
    wrong_event:        'Wrong event',
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">

      {/* Top bar */}
      <div className={`${accentClass} px-4 py-3 flex items-center gap-3`}>
        <CheckCircle className="w-5 h-5 text-white" />
        <span className="font-semibold text-sm">Ticket Check-In</span>
      </div>

      <div className="flex-1 flex flex-col items-center px-4 py-6 gap-5 max-w-md mx-auto w-full">

        {/* Event selector */}
        <div className="w-full">
          <label className="block text-xs text-gray-400 mb-1.5 font-medium uppercase tracking-wide">
            Scanning for event
          </label>
          {eventsLoading ? (
            <div className="bg-gray-800 rounded-xl h-12 animate-pulse" />
          ) : events.length === 0 ? (
            <div className="bg-gray-800 rounded-xl px-4 py-3 text-sm text-gray-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400" /> No events available
            </div>
          ) : (
            <div className="relative">
              <select
                value={selectedEvent?.id ?? ''}
                onChange={e => {
                  const ev = events.find(ev => ev.id === Number(e.target.value)) ?? null;
                  setSelectedEvent(ev);
                  setScannerState('idle');
                  setResult(null);
                  setManualCode('');
                }}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 pr-10 text-sm text-white appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">— Select an event —</option>
                {events.map(ev => (
                  <option key={ev.id} value={ev.id}>{ev.title}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          )}
        </div>

        {/* Mode tabs */}
        <div className="w-full bg-gray-800/60 rounded-xl p-1 flex gap-1">
          <button
            onClick={() => { setMode('camera'); setResult(null); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
              mode === 'camera' ? 'bg-gray-700 text-white shadow' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <Camera className="w-4 h-4" /> Scan QR
          </button>
          <button
            onClick={() => { setMode('code'); setResult(null); stopCamera(); setScannerState('idle'); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
              mode === 'code' ? 'bg-gray-700 text-white shadow' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <Keyboard className="w-4 h-4" /> Enter Code
          </button>
        </div>

        {/* Camera mode */}
        {mode === 'camera' && (
          <div className="w-full space-y-3">
            <div className="relative bg-black rounded-2xl overflow-hidden aspect-square w-full">
              <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />
              <canvas ref={canvasRef} className="hidden" />

              {/* Scan reticle */}
              {scannerState === 'scanning' && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-2/3 h-2/3 border-4 border-blue-400/70 rounded-2xl" />
                </div>
              )}

              {/* Processing overlay */}
              {scannerState === 'processing' && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-400 border-t-transparent" />
                </div>
              )}

              {/* Result overlay */}
              {scannerState === 'result' && result && (
                <div className={`absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center ${
                  result.accepted ? 'bg-green-700/95' : 'bg-red-700/95'
                }`}>
                  {result.accepted
                    ? <CheckCircle className="w-16 h-16 text-white" />
                    : <XCircle className="w-16 h-16 text-white" />}
                  <p className="text-white text-xl font-bold">
                    {result.accepted ? 'Admitted ✓' : reasonLabel[result.reason ?? ''] ?? 'Rejected'}
                  </p>
                  {result.ticket?.scan_method && (
                    <span className="text-white/60 text-xs bg-black/20 px-2 py-0.5 rounded-full">
                      {result.ticket.scan_method === 'qr_scan' ? 'QR Scan' : 'Manual Code'}
                    </span>
                  )}
                  {result.ticket && (
                    <div className="text-white/90 text-sm space-y-0.5">
                      <p className="font-semibold">{result.ticket.ticket_type_name}</p>
                      {result.ticket.holder_name && <p>{result.ticket.holder_name}</p>}
                      <p className="font-mono text-xs text-white/60">{result.ticket.code}</p>
                    </div>
                  )}
                  {!result.accepted && result.first_used_at && (
                    <p className="text-white/70 text-xs">
                      First scanned at {new Date(result.first_used_at).toLocaleTimeString()}
                    </p>
                  )}
                </div>
              )}

              {/* No event selected overlay */}
              {!selectedEvent && (
                <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center gap-3 px-6 text-center">
                  <Calendar className="w-10 h-10 text-gray-500" />
                  <p className="text-gray-400 text-sm">Select an event above to start scanning</p>
                </div>
              )}

              {/* Camera error / idle overlay */}
              {selectedEvent && scannerState === 'idle' && !result && (
                <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center gap-4 px-6 text-center">
                  <Camera className="w-10 h-10 text-gray-400" />
                  {cameraError && (
                    <p className="text-red-300 text-xs flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" /> {cameraError}
                    </p>
                  )}
                  <button
                    onClick={startCamera}
                    className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-medium text-sm hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" /> Start Camera
                  </button>
                </div>
              )}
            </div>

            {/* Hardware scanner hidden input — auto-focused when camera is live.
                USB/BT QR scanners behave like keyboards: they type the decoded
                string and press Enter. This input silently captures that. */}
            <input
              ref={hardwareScannerInputRef}
              type="text"
              className="opacity-0 absolute w-0 h-0 pointer-events-none"
              aria-hidden="true"
              tabIndex={-1}
              onChange={handleHardwareScannerInput}
              onKeyDown={handleHardwareScannerKeyDown}
            />

            <p className="text-gray-500 text-xs text-center">
              Point the camera at a ticket's QR code. Also works with USB/Bluetooth scanners.
            </p>
          </div>
        )}

        {/* Manual code mode */}
        {mode === 'code' && (
          <div className="w-full space-y-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1.5 font-medium uppercase tracking-wide">
                Ticket Code
              </label>
              <input
                type="text"
                value={manualCode}
                onChange={e => { setManualCode(e.target.value.toUpperCase()); setCodeError(null); }}
                onKeyDown={e => { if (e.key === 'Enter') submitCode(); }}
                placeholder="e.g. TKT-101-A3F9B2C1"
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 font-mono text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={!selectedEvent || scannerState === 'processing'}
              />
              {codeError && (
                <p className="text-red-400 text-xs mt-1.5">{codeError}</p>
              )}
              {!selectedEvent && (
                <p className="text-amber-400 text-xs mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> Select an event first
                </p>
              )}
            </div>

            <button
              onClick={submitCode}
              disabled={!manualCode.trim() || !selectedEvent || scannerState === 'processing'}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white py-3 rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2"
            >
              {scannerState === 'processing' ? (
                <><div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" /> Checking…</>
              ) : (
                'Check In'
              )}
            </button>

            {/* Code result card */}
            {scannerState === 'result' && result && (
              <div className={`rounded-xl p-5 text-center ${
                result.accepted ? 'bg-green-900/60 border border-green-700' : 'bg-red-900/60 border border-red-700'
              }`}>
                {result.accepted
                  ? <CheckCircle className="w-10 h-10 text-green-400 mx-auto mb-2" />
                  : <XCircle className="w-10 h-10 text-red-400 mx-auto mb-2" />}
                <p className="font-bold text-white">
                  {result.accepted ? 'Admitted ✓' : reasonLabel[result.reason ?? ''] ?? 'Rejected'}
                </p>
                {result.ticket?.scan_method && (
                  <span className="text-white/60 text-xs bg-black/20 px-2 py-0.5 rounded-full mt-1 inline-block">
                    {result.ticket.scan_method === 'qr_scan' ? 'QR Scan' : 'Manual Code'}
                  </span>
                )}
                {result.ticket && (
                  <div className="text-sm text-gray-300 mt-1 space-y-0.5">
                    <p>{result.ticket.event_title}</p>
                    <p>{result.ticket.ticket_type_name}</p>
                    {result.ticket.holder_name && <p>{result.ticket.holder_name}</p>}
                  </div>
                )}
                {!result.accepted && result.first_used_at && (
                  <p className="text-xs text-gray-400 mt-1.5">
                    First scanned at {new Date(result.first_used_at).toLocaleTimeString()}
                    {result.ticket?.scanned_by && ` by ${result.ticket.scanned_by}`}
                  </p>
                )}
              </div>
            )}

            <p className="text-gray-500 text-xs text-center">
              Use this when the QR code can't be scanned. Press Enter to submit.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckInPage;