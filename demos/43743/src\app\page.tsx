import { redirect } from 'next/navigation';
import { getCurrentProfile } from '@/lib/auth';
import { queryOne } from '@/lib/db';

export default async function RootPage() {
  const profile = getCurrentProfile();
  if (!profile) {
    redirect('/login');
  }
  // 已登录：检查是否有 child
  const child = queryOne<{ id: string }>(
    'SELECT id FROM children WHERE profile_id = :pid LIMIT 1',
    { pid: profile.profileId }
  );
  if (!child) {
    redirect('/onboarding');
  }
  redirect('/home');
}
