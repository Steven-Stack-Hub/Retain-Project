import { NextRequest } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

const API_URL = `https://api-inference.huggingface.co/models/${process.env.HUGGINGFACE_SUMMARIZE_MODEL}`;

export async function POST(req: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return new Response('Unauthorized', { status: 401 });

  const { text, maxLength = 150 } = await req.json();
  if (!text) return new Response('Missing text', { status: 400 });

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        inputs: text,
        parameters: { max_length: maxLength, min_length: 50, do_sample: false }
      })
    });

    if (!response.ok) throw new Error('HF API error');
    const result = await response.json();
    
    return new Response(JSON.stringify({ summary: result[0].summary_text }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err: any) {
    return new Response(`Summarization failed: ${err.message}`, { status: 500 });
  }
}