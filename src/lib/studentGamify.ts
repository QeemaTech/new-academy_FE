import type { LucideIcon } from 'lucide-react';
import { Gamepad2, Rocket, Sparkles, Star, Trophy, Zap, Target, Flame } from 'lucide-react';

const MISSION_ICONS: LucideIcon[] = [Rocket, Gamepad2, Star, Trophy, Zap, Target, Flame, Sparkles];

const MISSION_PALETTES = [
  { bg: 'bg-[#4178EF]', ring: 'ring-[#4178EF]/30', shadow: 'shadow-[#4178EF]/40', stroke: '#4178EF' },
  { bg: 'bg-[#FFD100]', ring: 'ring-[#FFD100]/40', shadow: 'shadow-[#FFD100]/35', stroke: '#E6BC00' },
  { bg: 'bg-[#22C55E]', ring: 'ring-emerald-400/40', shadow: 'shadow-emerald-500/30', stroke: '#16A34A' },
  { bg: 'bg-[#A855F7]', ring: 'ring-violet-400/40', shadow: 'shadow-violet-500/30', stroke: '#9333EA' },
  { bg: 'bg-[#38BDF8]', ring: 'ring-sky-400/40', shadow: 'shadow-sky-500/30', stroke: '#0EA5E9' },
  { bg: 'bg-[#FB7185]', ring: 'ring-rose-400/40', shadow: 'shadow-rose-500/30', stroke: '#F43F5E' },
];

function hashId(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h << 5) - h + id.charCodeAt(i);
  return Math.abs(h);
}

export function getMissionVisual(trackId: string) {
  const h = hashId(trackId);
  const Icon = MISSION_ICONS[h % MISSION_ICONS.length];
  const palette = MISSION_PALETTES[h % MISSION_PALETTES.length];
  return { Icon, palette };
}
