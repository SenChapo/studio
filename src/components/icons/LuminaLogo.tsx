import type { SVGProps } from 'react';

export function LuminaLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 180 32"
      width="120"
      height="32"
      aria-label="Lumina AI Logo"
      {...props}
    >
      <defs>
        <linearGradient id="luminaGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style={{ stopColor: 'hsl(var(--primary))', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: 'hsl(var(--accent))', stopOpacity: 1 }} />
        </linearGradient>
      </defs>
      <text
        x="0"
        y="24"
        fontFamily="var(--font-geist-sans), system-ui, sans-serif"
        fontSize="28"
        fontWeight="bold"
        fill="url(#luminaGradient)"
      >
        Lumina
      </text>
      <text
        x="125"
        y="24"
        fontFamily="var(--font-geist-sans), system-ui, sans-serif"
        fontSize="28"
        fontWeight="normal"
        fill="hsl(var(--foreground))"
      >
        AI
      </text>
    </svg>
  );
}
