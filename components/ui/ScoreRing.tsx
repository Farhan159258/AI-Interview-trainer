'use client';

import { motion } from 'framer-motion';

export function ScoreRing({
  score,
  max = 100,
  size = 96,
  label,
}: {
  score: number;
  max?: number;
  size?: number;
  label?: string;
}) {
  const pct = Math.max(0, Math.min(1, score / max));
  const radius = (size - 12) / 2;
  const circumference = 2 * Math.PI * radius;
  const color = pct >= 0.8 ? '#3DDC97' : pct >= 0.6 ? '#00E5C7' : pct >= 0.4 ? '#F5A623' : '#FF5C7A';

  return (
    <div className="relative flex flex-col items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="rgba(255,255,255,0.08)" strokeWidth={8} fill="none" />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={8}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference * (1 - pct) }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-xl font-display font-semibold text-white">{Math.round(score)}</span>
        {label && <span className="text-[10px] uppercase tracking-wide text-white/40">{label}</span>}
      </div>
    </div>
  );
}
