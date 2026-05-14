/**
 * 灌入种子数据脚本
 *
 * 用法: pnpm run seed
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { mathChapter1 } from './math_chapter_1';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function main() {
  console.log('开始灌入数学第 1 章节...');

  for (const node of mathChapter1) {
    const { error } = await supabase.from('knowledge_nodes').upsert(node as any);
    if (error) {
      console.error(`节点 ${node.id} 写入失败:`, error.message);
    } else {
      console.log(`✓ ${node.id} — ${node.title}`);
    }
  }

  console.log('\n完成。共 ' + mathChapter1.length + ' 个节点。');
  console.log('\n下一步:打开 http://localhost:3000 看到主页');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
