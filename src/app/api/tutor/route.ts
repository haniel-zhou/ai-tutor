/**
 * POST /api/tutor
 *
 * Explainer Agent 的流式接口。
 * 前端发送 messages 历史 + nodeId,服务端流式返回 Claude 讲解。
 */

import { NextRequest } from 'next/server';
import { explainerStream } from '@/lib/ai/agents';
import { getNode, getStudentMasteryForPrerequisites, logEvent } from '@/lib/db/queries';

export const runtime = 'nodejs'; // 需要 fs/path 模块

export async function POST(req: NextRequest) {
  try {
    const { nodeId, userId, messages } = await req.json();

    if (!nodeId || !userId || !messages) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
      });
    }

    // 取节点信息
    const node = await getNode(nodeId);

    // 取学生在先决条件上的掌握情况(给 Explainer 做上下文)
    const studentHistory = await getStudentMasteryForPrerequisites(userId, nodeId);

    // 流式调用 Claude
    const result = explainerStream({
      node: {
        id: node.id,
        title: node.title,
        description: node.description,
        learning_objectives: node.learning_objectives,
        difficulty: node.difficulty,
      },
      studentHistory: studentHistory.map((h) => ({
        node_title: h.node_title,
        mastery_level: h.mastery_level,
      })),
      messages,
    });

    // 异步记录事件(不阻塞流)
    logEvent({
      user_id: userId,
      node_id: nodeId,
      event_type: 'explanation_started',
      payload: { messages_count: messages.length },
      agent: 'explainer',
    }).catch(console.error);

    return result.toDataStreamResponse();
  } catch (err: any) {
    console.error('/api/tutor error:', err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}