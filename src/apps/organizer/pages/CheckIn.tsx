// src/apps/organizer/pages/CheckIn.tsx
//
// Browser-camera ticket scanning page for gate staff.
// Install: npm install jsqr
//          npm install -D @types/jsqr   (check first — recent jsqr
//          versions ship their own .d.ts)
//
// Flow: request camera -> continuously decode frames -> on a successful
// QR decode, immediately POST the raw payload to /organizers/me/check-in
// -> show a clear accept/reject result -> after a short pause, resume
// scanning automatically so staff don't need to tap between guests.

import React, { useEffect, useRef, useState, useCallback } from 'react';
import jsQR from 'jsqr';
import { CheckCircle, XCircle, Camera, AlertCircle, RotateCcw } from 'lucide-react';
import { checkInTicket, type CheckInResponse } from '@organizer/services/checkInService';

type ScannerState = 'idle' | 'scanning' | 'processing' | 'result';

const RESULT_DISPLAY_MS = 2500; // how long a result stays on screen before auto-resuming

const CheckInPage: React.FC = () => {
  const videoRef  = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef    = useRef<number | null>(null);
  // Tracks the payload currently in-flight to the API so the scan loop
  // doesn't fire a second request for the same decoded payload while the
  // first is still pending (camera frames decode much faster than a
  // network round trip).
  const inFlightPayload = useRef<string | null>(null);

  const [state, setState]             = useState<ScannerState>('idle');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [result, setResult]           = useState<CheckInResponse | null>(null);

  // ── Camera lifecycle ─────────────────────────────────────────────────────

  const startCamera = useCallback(async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }, // rear camera on phones
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setState('scanning');
    } catch {
      setCameraError('Could not access the camera. Please grant camera permission and try again.');
      setState('idle');
    }
  }, []);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
  }, []);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [startCamera, stopCamera]);

  // ── Check-in call ────────────────────────────────────────────────────────

  const handleDecodedPayload = useCallback(async (payload: string) => {
    setState('processing');
    try {
      const response = await checkInTicket(payload);
      setResult(response);
    } catch {
      setResult({ accepted: false, reason: 'invalid_signature', ticket: null, first_used_at: null });
    } finally {
      setState('result');
      window.setTimeout(() => {
        inFlightPayload.current = null;
        setResult(null);
        setState('scanning');
      }, RESULT_DISPLAY_MS);
    }
  }, []);

  // ── Scan loop ────────────────────────────────────────────────────────────

  const tick = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (state === 'scanning' && video && canvas && video.readyState === video.HAVE_ENOUGH_DATA) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const decoded = jsQR(imageData.data, imageData.width, imageData.height);

        if (decoded?.data && inFlightPayload.current !== decoded.data) {
          inFlightPayload.current = decoded.data;
          handleDecodedPayload(decoded.data);
        }
      }
    }

    rafRef.current = requestAnimationFrame(tick);
  }, [state, handleDecodedPayload]);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [tick]);

  // ── Render ───────────────────────────────────────────────────────────────

  const reasonLabel: Record<string, string> = {
    already_used:     'Already scanned',
    cancelled:         'Ticket cancelled',
    not_found:         'Ticket not found',
    invalid_signature: 'Invalid or corrupted QR code',
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <h1 className="text-white text-xl font-bold text-center mb-4">Ticket Check-In</h1>

        {/* Camera preview */}
        <div className="relative bg-black rounded-2xl overflow-hidden aspect-square">
          <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />
          <canvas ref={canvasRef} className="hidden" />

          {/* Scan reticle */}
          {state === 'scanning' && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-2/3 h-2/3 border-4 border-blue-400/70 rounded-2xl" />
            </div>
          )}

          {/* Processing overlay */}
          {state === 'processing' && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-400 border-t-transparent" />
            </div>
          )}

          {/* Result overlay */}
          {state === 'result' && result && (
            <div className={`absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center ${
              result.accepted ? 'bg-green-600/95' : 'bg-red-600/95'
            }`}>
              {result.accepted
                ? <CheckCircle className="w-16 h-16 text-white" />
                : <XCircle className="w-16 h-16 text-white" />}
              <p className="text-white text-lg font-bold">
                {result.accepted ? 'Checked In' : reasonLabel[result.reason ?? ''] ?? 'Rejected'}
              </p>
              {result.ticket && (
                <div className="text-white/90 text-sm space-y-0.5">
                  <p className="font-medium">{result.ticket.event_title}</p>
                  <p>{result.ticket.ticket_type_name}</p>
                  {result.ticket.holder_name && <p>{result.ticket.holder_name}</p>}
                </div>
              )}
              {!result.accepted && result.first_used_at && (
                <p className="text-white/80 text-xs">
                  First scanned {new Date(result.first_used_at).toLocaleTimeString()}
                </p>
              )}
            </div>
          )}

          {/* Camera error / idle overlay */}
          {state === 'idle' && (
            <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center gap-4 px-6 text-center">
              <Camera className="w-12 h-12 text-gray-400" />
              {cameraError && (
                <p className="text-red-300 text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" /> {cameraError}
                </p>
              )}
              <button
                onClick={startCamera}
                className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" /> Start Camera
              </button>
            </div>
          )}
        </div>

        <p className="text-gray-400 text-sm text-center mt-4">
          Point the camera at a ticket's QR code. The result clears automatically.
        </p>
      </div>
    </div>
  );
};

export default CheckInPage;