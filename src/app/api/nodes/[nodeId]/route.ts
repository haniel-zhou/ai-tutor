/**
 * GET /api/nodes/[nodeId]
 * 获取单个知识节点详情
 */

import { NextRequest, NextResponse } from 'next/server';
import { getNode } from '@/lib/db/queries';

export const runtime = 'nodejs';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ nodeId: string }> }
) {
  try {
    const { nodeId } = await params;
    const node = await getNode(nodeId);

    if (!node) {
      return NextResponse.json({ error: 'Node not found' }, { status: 404 });
    }

    return NextResponse.json({ node });
  } catch (err: any) {
    console.error('/api/nodes/[nodeId] error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}