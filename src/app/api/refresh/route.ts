import { NextRequest } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !session) return new Response('Unauthorized', { status: 401 });

  const { user } = session;

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('last_refresh_count, refresh_threshold')
    .eq('id', user.id)
    .single();

  if (error) return new Response(error.message, { status: 500 });

  let newCount = (profile.last_refresh_count || 0) + 1;
  const threshold = profile.refresh_threshold || 5;

  if (newCount >= threshold) {
    newCount = 0;
    await supabase
      .from('profiles')
      .update({ last_cycle_at: new Date().toISOString() })
      .eq('id', user.id);
  }

  await supabase
    .from('profiles')
    .update({ last_refresh_count: newCount })
    .eq('id', user.id);

  return new Response(JSON.stringify({
    refresh_count: newCount,
    threshold,
    new_batch: newCount === 0
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
}