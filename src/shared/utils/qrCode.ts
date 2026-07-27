// src/shared/utils/qrCode.ts
//
// Wraps the `qrcode` npm package for ticket QR rendering and download.
// Requires: npm install qrcode && npm install -D @types/qrcode
//
// The value passed to both functions should be `ticket.qr_payload` (the
// signed JSON string from the backend), NOT the bare ticket code — the
// gate scanner verifies the embedded HMAC signature before calling the
// check-in endpoint, so encoding just the code would make every scan fail.

import QRCode from 'qrcode';

/**
 * Render a QR code for the given value onto an existing <canvas> element.
 * Call this inside a useEffect once the canvas ref is mounted.
 *
 * @param canvas  - The canvas DOM element to draw onto
 * @param value   - The string to encode (ticket.qr_payload)
 * @param size    - Canvas width/height in px (default 240, suitable for modal display)
 */
export async function renderQrToCanvas(
  canvas: HTMLCanvasElement,
  value: string,
  size = 240,
): Promise<void> {
  await QRCode.toCanvas(canvas, value, {
    width: size,
    margin: 1,
    color: {
      dark: '#1f2937',   // gray-800 — matches app text colour
      light: '#ffffff',
    },
  });
}

/**
 * Generate a high-resolution QR PNG for the given value and trigger a
 * browser download. The file is named {filenameBase}.png — callers supply
 * the FULL filename base, including any prefix they want (e.g.
 * "ticket-TKT-101-A3F9B2C1" for a ticket, "event-summer-fest-2026" for an
 * event share, or "mgltickets" for the site itself). This util is shared
 * across tickets, event shares, and the site QR, so it no longer assumes
 * "ticket-" is always the right prefix.
 *
 * @param value        - The string to encode (a ticket's qr_payload, or a plain URL)
 * @param filenameBase - The full desired filename, without extension
 */
export async function downloadQrCode(
  value: string,
  filenameBase: string,
): Promise<void> {
  const dataUrl = await QRCode.toDataURL(value, {
    width: 480,   // higher resolution for download vs on-screen display
    margin: 2,
    color: {
      dark: '#1f2937',
      light: '#ffffff',
    },
  });

  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = `${filenameBase}.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}