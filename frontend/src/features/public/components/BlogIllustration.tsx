import type { LucideIcon } from 'lucide-react';

interface Props {
  icon: LucideIcon;
  accent: string;
  gradientId: string;
  iconSize?: number;
}

export function BlogIllustration({ icon: Icon, accent, gradientId, iconSize = 40 }: Props) {
  return (
    <svg viewBox="0 0 400 220" role="img" className="w-full h-full">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#123320" />
          <stop offset="100%" stopColor="#04140a" />
        </linearGradient>
        <radialGradient id={`${gradientId}-glow`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={accent} stopOpacity="0.35" />
          <stop offset="100%" stopColor={accent} stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width="400" height="220" fill={`url(#${gradientId})`} />

      {/* Halo coloré derrière l'icône */}
      <circle cx="200" cy="110" r="100" fill={`url(#${gradientId}-glow)`} />

      {/* Motif de points en diagonale, discret */}
      <g opacity="0.15">
        {Array.from({ length: 6 }).map((_, row) =>
          Array.from({ length: 10 }).map((_, col) => (
            <circle
              key={`${row}-${col}`}
              cx={20 + col * 42 + (row % 2 === 0 ? 0 : 21)}
              cy={10 + row * 38}
              r="1.6"
              fill="#ffffff"
            />
          ))
        )}
      </g>

      {/* Blobs décoratifs */}
      <circle cx="40" cy="190" r="55" fill="#22c55e" opacity="0.12" />
      <circle cx="370" cy="20" r="65" fill="#4ade80" opacity="0.1" />

      {/* Bande d'accent diagonale */}
      <path d="M0 220 L120 60 L170 60 L60 220 Z" fill="#ffffff" opacity="0.03" />

      {/* Cercle icône avec bordure et ombre portée simulée */}
      <circle cx="200" cy="110" r="42" fill="#0a1f11" opacity="0.4" />
      <circle cx="200" cy="110" r="38" fill="#ffffff" fillOpacity="0.08" stroke={accent} strokeWidth="1.5" strokeOpacity="0.6" />
      <foreignObject x={200 - iconSize / 2} y={110 - iconSize / 2} width={iconSize} height={iconSize}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
          <Icon size={iconSize * 0.55} color={accent} strokeWidth={1.75} />
        </div>
      </foreignObject>
    </svg>
  );
}
