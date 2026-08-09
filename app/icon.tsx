import { ImageResponse } from 'next/og'

export const size = { height: 32, width: 32 }

export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
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
          <rect x="3" y="4" width="18" height="18" rx="3" />
          <path d="M3 10h18M8 2v4M16 2v4" />
          <circle cx="16" cy="16" r="1.6" fill="#1b50ff" stroke="none" />
        </svg>
      </div>
    ),
    size,
  )
}
