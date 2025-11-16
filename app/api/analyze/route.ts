// app/api/analyze/route.ts
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';

function cosine(a: number[], b: number[]) {
  const dot = a.reduce((sum, v, i) => sum + v * b[i], 0);
  const magA = Math.sqrt(a.reduce((sum, v) => sum + v * v, 0));
  const magB = Math.sqrt(b.reduce((sum, v) => sum + v * v, 0));
  if (!magA || !magB) return 0;
  return dot / (magA * magB);
}

export async function POST(req: Request) {
  const formData = await req.formData();
  const files = formData.getAll('frames') as File[];

  // If not enough frames, return default
  if (!files || files.length < 2) {
    return NextResponse.json(
      {
        continuityScore: 100,
        similarities: [],
        issues: [],
      },
      { status: 200 }
    );
  }

  // Very simple "embeddings" based on file bytes (MVP local logic)
  const embeddings: number[][] = [];
  for (const file of files) {
    const buf = Buffer.from(await file.arrayBuffer());
    const len = buf.length;

    const e1 = len;
    const e2 = buf[0] ?? 0;
    const e3 = buf[Math.floor(len / 2)] ?? 0;

    const norm = Math.sqrt(e1 * e1 + e2 * e2 + e3 * e3) || 1;
    embeddings.push([e1 / norm, e2 / norm, e3 / norm]);
  }

  const similarities: number[] = [];
  for (let i = 0; i < embeddings.length - 1; i++) {
    similarities.push(cosine(embeddings[i], embeddings[i + 1]));
  }

  const avgSim =
    similarities.reduce((acc, v) => acc + v, 0) / similarities.length;

  const continuityScore = Math.round(Math.max(0, Math.min(1, avgSim)) * 100);

  const issues = similarities
    .map((sim, idx) => {
      const drop = avgSim - sim;
      if (drop < 0.1) return null;

      let description = 'Abrupt visual change detected between frames.';
      if (drop > 0.3) {
        description = 'Severe visual discontinuity between frames.';
      }

      return {
        framePair: [idx + 1, idx + 2],
        type: 'visual_jump',
        description,
        similarity: sim,
      };
    })
    .filter(Boolean);

  return NextResponse.json(
    {
      continuityScore,
      similarities,
      issues,
    },
    { status: 200 }
  );
}
