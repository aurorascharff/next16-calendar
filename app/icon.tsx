import { ImageResponse } from 'next/og';

export const size = { height: 32, width: 32 };

export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    <svg
      width="32"
      height="32"
      viewBox="0 0 72 72"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        height: '32px',
        width: '32px',
      }}
    >
      <rect x="14" y="19" width="34" height="9" rx="4.5" fill="#1B50FF" />
      <rect x="26" y="31.5" width="32" height="9" rx="4.5" fill="#1B50FF" />
      <rect x="14" y="44" width="26" height="9" rx="4.5" fill="#1B50FF" />
    </svg>,
    size,
  );
}
