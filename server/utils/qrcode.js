import QRCode from 'qrcode';
import crypto from 'crypto';

// Generate a unique verification code
export const generateVerificationCode = () => {
  return crypto.randomBytes(3).toString('hex').toUpperCase(); // 6-character code
};

// Generate QR code as data URL
export const generateQRCode = async (data) => {
  try {
    const qrCodeDataURL = await QRCode.toDataURL(JSON.stringify(data), {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      quality: 0.95,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });
    return qrCodeDataURL;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw new Error('Failed to generate QR code');
  }
};

// Verify QR code data
export const verifyQRCode = (qrData, expectedData) => {
  try {
    const parsed = JSON.parse(qrData);
    return (
      parsed.claimId === expectedData.claimId &&
      parsed.verificationCode === expectedData.verificationCode
    );
  } catch (error) {
    return false;
  }
};

