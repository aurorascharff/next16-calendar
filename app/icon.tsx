import { ImageResponse } from 'next/og';

export const size = { height: 32, width: 32 };

export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        alignItems: 'center',
        background: 'transparent',
        display: 'flex',
        height: '100%',
        justifyContent: 'center',
        width: '100%',
      }}
    >
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#1b50ff"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M5 17h14" />
        <path d="M7.5 17a4.5 4.5 0 0 1 9 0" />
        <path d="M12 5v3M5.6 10.6l2.1 2.1M18.4 10.6l-2.1 2.1" />
        <path d="M4 21h16" />
      </svg>
    </div>,
    size,
  );
}
