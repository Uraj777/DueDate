/**
 * DueDate - UPI Link Generator & QR Code Service (JavaScript)
 * Generates official NPCI UPI intent URLs and QR code representations.
 */

import QRCode from 'qrcode';

export const UPI_REGEX = /^[a-zA-Z0-9.\-_]{2,64}@[a-zA-Z0-9]{2,64}$/;

export function validateUPIId(upiId) {
  if (!upiId || typeof upiId !== 'string') {
    return {
      isValid: false,
      error: 'UPI ID cannot be blank.'
    };
  }

  const clean = upiId.trim();
  if (!UPI_REGEX.test(clean)) {
    return {
      isValid: false,
      error: 'UPI galat hai (Format must be user@bank e.g. shanti@okhdfcbank or fitflex@upi).'
    };
  }

  return {
    isValid: true,
    error: null,
    cleaned: clean
  };
}

export function generateUPILink({ upiId, amount, payeeName = 'DueDate', note = 'Fee Dues' }) {
  const cleanUpi = (upiId || '').trim();
  const cleanPayee = encodeURIComponent((payeeName || '').trim());
  const cleanNote = encodeURIComponent((note || '').trim());
  const formattedAmount = Number(amount || 0).toFixed(2);

  return `upi://pay?pa=${cleanUpi}&pn=${cleanPayee}&am=${formattedAmount}&tn=${cleanNote}&cu=INR`;
}

export async function generateQRCodeDataURL(text) {
  try {
    const dataUrl = await QRCode.toDataURL(text, {
      width: 280,
      margin: 2,
      color: {
        dark: '#0f172a',
        light: '#ffffff'
      },
      errorCorrectionLevel: 'M'
    });
    return dataUrl;
  } catch (err) {
    console.error('QR code generation error:', err);
    return null;
  }
}
