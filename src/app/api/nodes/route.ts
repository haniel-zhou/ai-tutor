/**
 * GET /api/nodes
 * 获取知识节点列表（可选按 subject 过滤）
 */

import { NextRequest, NextResponse } from 'next/server';
import { getNodesBySubject } from '@/lib/db/queries';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const subject = searchParams.get('subject') || 'math';

    const nodes = await getNodesBySubject(subject);

    return NextResponse.json({ nodes });
  } catch (err: any) {
    console.error('/api/nodes error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}