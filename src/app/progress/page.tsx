/**
 * /progress 页面
 * 展示知识图谱 DAG 可视化和学习进度统计
 */

import { getNodesBySubject } from '@/lib/db/queries';
import { supabaseAdmin } from '@/lib/db/supabase';
import ProgressPageClient from './ProgressPageClient';

export default async function ProgressPage() {
  const userId = 'mattaniah';
  
  // 获取所有知识节点
  const nodes = await getNodesBySubject('math');
  
  // 获取用户的掌握度数据
  const { data: masteryStates } = await supabaseAdmin
    .from('mastery_states')
    .select('*')
    .eq('user_id', userId);
  
  // 合并节点数据和掌握度
  const masteryMap = new Map(
    (masteryStates || []).map((m: any) => [m.node_id, m])
  );
  
  const nodesWithMastery = nodes.map((node: any) => {
    const mastery = masteryMap.get(node.id);
    return {
      id: node.id,
      title: node.title,
      subject: node.subject,
      chapter: node.chapter,
      difficulty: node.difficulty,
      prerequisites: node.prerequisites || [],
      mastery_level: mastery?.mastery_level || 0,
      is_mastered: mastery?.is_mastered || false,
      first_studied_at: mastery?.first_studied_at || null,
      mastered_at: mastery?.mastered_at || null,
      fsrs_state: mastery?.fsrs_state || 'new',
    };
  });

  return <ProgressPageClient nodes={nodesWithMastery} userId={userId} />;
}
