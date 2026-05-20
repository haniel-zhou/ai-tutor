/**
 * 灌入种子数据脚本
 *
 * 用法:
 *   pnpm run seed           # 灌入所有章节
 *   pnpm run seed -- ch1   # 只灌入第1章
 *   pnpm run seed -- ch2    # 只灌入第2章
 *   pnpm run seed -- ch3    # 只灌入第3章
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { mathChapter1 } from './math_chapter_1';
import { mathChapter2 } from './math_chapter_2';
import { mathChapter3 } from './math_chapter_3';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// 章节映射
const chapters: Record<string, any[]> = {
  ch1: mathChapter1,
  ch2: mathChapter2,
  ch3: mathChapter3,
};

// 命令行参数解析
const args = process.argv.slice(2);
const targetChapters = args.length > 0 ? args : Object.keys(chapters);

async function seedChapter(chapterKey: string, nodes: any[]) {
  console.log(`\n📚 开始灌入数学第 ${chapterKey.replace('ch', '')} 章节 (${nodes.length} 个节点)...`);
  
  let successCount = 0;
  let failCount = 0;

  for (const node of nodes) {
    const { error } = await supabase.from('knowledge_nodes').upsert(node as any);
    if (error) {
      console.error(`  ✗ ${node.id} — ${node.title}`);
      console.error(`    错误: ${error.message}`);
      failCount++;
    } else {
      console.log(`  ✓ ${node.id} — ${node.title}`);
      successCount++;
    }
  }

  console.log(`\n  章节 ${chapterKey}: 成功 ${successCount}, 失败 ${failCount}`);
  return { successCount, failCount };
}

async function main() {
  console.log('='.repeat(50));
  console.log('AI Tutor MVP — 种子数据灌入脚本');
  console.log('='.repeat(50));

  let totalSuccess = 0;
  let totalFail = 0;

  for (const chapterKey of targetChapters) {
    if (!chapters[chapterKey]) {
      console.error(`\n✗ 未知章节: ${chapterKey}`);
      console.log(`  可用章节: ${Object.keys(chapters).join(', ')}`);
      continue;
    }

    const result = await seedChapter(chapterKey, chapters[chapterKey]);
    totalSuccess += result.successCount;
    totalFail += result.failCount;
  }

  console.log('\n' + '='.repeat(50));
  console.log('灌入完成!');
  console.log(`  总计: 成功 ${totalSuccess}, 失败 ${totalFail}`);
  console.log('='.repeat(50));
  console.log('\n下一步: 打开 http://localhost:3000 查看');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
