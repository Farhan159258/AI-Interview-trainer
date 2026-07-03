'use client';

import { useState } from 'react';
import { Award, Flame, Star } from 'lucide-react';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useAuthStore } from '@/store/authStore';
import { upsertUserProfile } from '@/firebase/firestore';
import { calculateLevel } from '@/lib/utils';
import type { JobRole } from '@/types';

const ROLES: JobRole[] = [
  'Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'Data Analyst',
  'Data Scientist', 'AI Engineer', 'Cloud Engineer', 'DevOps Engineer', 'Custom Role',
];

const BADGE_ICONS: Record<string, string> = {
  first_interview: '🎯',
  five_day_streak: '🔥',
  top_performer: '🏆',
  coding_expert: '💻',
};

export default function ProfilePage() {
  const { user, firebaseUid, setUser } = useAuthStore();
  const [displayName, setDisplayName] = useState(user?.displayName ?? '');
  const [targetRole, setTargetRole] = useState<JobRole | undefined>(user?.targetRole);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  if (!user || !firebaseUid) {
    return <div className="mx-auto max-w-2xl px-6 py-16 text-center text-white/40">Loading profile…</div>;
  }

  const level = calculateLevel(user.xp);
  const xpIntoLevel = user.xp % 500;

  const save = async () => {
    setSaving(true);
    setSaved(false);
    await upsertUserProfile(firebaseUid, { displayName, targetRole });
    setUser({ ...user, displayName, targetRole });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="font-display text-2xl font-semibold text-white">Your profile</h1>

      <GlassPanel className="mt-6 p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-500/20 text-xl font-semibold text-primary-200">
            {user.displayName?.[0]?.toUpperCase() ?? 'U'}
          </div>
          <div>
            <p className="font-display text-lg font-semibold text-white">{user.displayName}</p>
            <p className="text-sm text-white/40">{user.email}</p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-3 text-center">
          <div className="rounded-lg bg-white/5 py-3">
            <p className="flex items-center justify-center gap-1 font-display text-lg font-semibold text-white"><Star className="h-4 w-4 text-primary-300" /> {level}</p>
            <p className="text-[10px] text-white/40">Level</p>
          </div>
          <div className="rounded-lg bg-white/5 py-3">
            <p className="flex items-center justify-center gap-1 font-display text-lg font-semibold text-white"><Flame className="h-4 w-4 text-warn" /> {user.streakCount}</p>
            <p className="text-[10px] text-white/40">Day streak</p>
          </div>
          <div className="rounded-lg bg-white/5 py-3">
            <p className="flex items-center justify-center gap-1 font-display text-lg font-semibold text-white"><Award className="h-4 w-4 text-accent" /> {user.achievements.length}</p>
            <p className="text-[10px] text-white/40">Badges</p>
          </div>
        </div>

        <div className="mt-4">
          <div className="flex justify-between text-xs text-white/40">
            <span>XP</span>
            <span>{xpIntoLevel} / 500 to level {level + 1}</span>
          </div>
          <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-white/5">
            <div className="h-full rounded-full bg-primary-500" style={{ width: `${(xpIntoLevel / 500) * 100}%` }} />
          </div>
        </div>
      </GlassPanel>

      <GlassPanel className="mt-6 p-6">
        <h3 className="font-display text-sm font-semibold text-white">Edit profile</h3>
        <div className="mt-4 flex flex-col gap-4">
          <Input label="Display name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
          <div>
            <p className="mb-2 text-sm font-medium text-white/70">Target role</p>
            <div className="flex flex-wrap gap-2">
              {ROLES.map((r) => (
                <button
                  key={r}
                  onClick={() => setTargetRole(r)}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                    targetRole === r ? 'border-primary-500 bg-primary-500/15 text-white' : 'border-border bg-white/5 text-white/50 hover:bg-white/10'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
          <Button onClick={save} loading={saving}>{saved ? 'Saved!' : 'Save changes'}</Button>
        </div>
      </GlassPanel>

      {user.achievements.length > 0 && (
        <GlassPanel className="mt-6 p-6">
          <h3 className="font-display text-sm font-semibold text-white">Achievements</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {user.achievements.map((a) => (
              <Badge key={a} tone="accent">{BADGE_ICONS[a] ?? '⭐'} {a.replace(/_/g, ' ')}</Badge>
            ))}
          </div>
        </GlassPanel>
      )}
    </div>
  );
}
