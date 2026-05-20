'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';

interface Node {
  id: string;
  title: string;
  subject: string;
  chapter: string;
  difficulty: number;
  prerequisites: string[];
  mastery_level?: number;
  is_mastered?: boolean;
  first_studied_at?: string;
  mastered_at?: string;
  fsrs_state?: string;
}

interface ProgressClientProps {
  nodes: Node[];
  userId: string;
}

export default function ProgressPageClient({ nodes, userId }: ProgressClientProps) {
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [subjectFilter, setSubjectFilter] = useState<string>('all');
  const [chapterFilter, setChapterFilter] = useState<string>('all');

  // 获取所有学科
  const subjects = useMemo(() => {
    const set = new Set(nodes.map((n) => n.subject));
    return ['all', ...Array.from(set)];
  }, [nodes]);

  // 获取当前学科的所有章节
  const chapters = useMemo(() => {
    const filtered = subjectFilter === 'all' ? nodes : nodes.filter((n) => n.subject === subjectFilter);
    const set = new Set(filtered.map((n) => n.chapter));
    return ['all', ...Array.from(set)];
  }, [nodes, subjectFilter]);

  // 过滤后的节点
  const filteredNodes = useMemo(() => {
    return nodes.filter((n) => {
      if (subjectFilter !== 'all' && n.subject !== subjectFilter) return false;
      if (chapterFilter !== 'all' && n.chapter !== chapterFilter) return false;
      return true;
    });
  }, [nodes, subjectFilter, chapterFilter]);

  // 按章节分组
  const groupedNodes = useMemo(() => {
    const map = new Map<string, Node[]>();
    filteredNodes.forEach((node) => {
      const list = map.get(node.chapter) || [];
      list.push(node);
      map.set(node.chapter, list);
    });
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [filteredNodes]);

  // 统计数据
  const stats = useMemo(() => {
    const total = nodes.length;
    const mastered = nodes.filter((n) => n.mastery_level && n.mastery_level >= 0.85).length;
    const learning = nodes.filter((n) => n.mastery_level && n.mastery_level > 0 && n.mastery_level < 0.85).length;
    const notStarted = total - mastered - learning;
    const avgMastery = total > 0 ? nodes.reduce((sum, n) => sum + (n.mastery_level || 0), 0) / total : 0;
    return { total, mastered, learning, notStarted, avgMastery };
  }, [nodes]);

  const getNodeStatus = (node: Node) => {
    if (!node.mastery_level || node.mastery_level === 0) return 'not_started';
    if (node.mastery_level >= 0.85) return 'mastered';
    return 'learning';
  };

  const getNodeColor = (status: string) => {
    switch (status) {
      case 'mastered': return 'bg-green-500 border-green-600 text-white';
      case 'learning': return 'bg-yellow-400 border-yellow-500 text-gray-800';
      default: return 'bg-gray-100 border-gray-300 text-gray-600 hover:border-blue-400';
    }
  };

  const getNodeLabel = (node: Node) => {
    const status = getNodeStatus(node);
    const mastery = node.mastery_level ? Math.round(node.mastery_level * 100) : 0;
    return { status, mastery };
  };

  // DAG 依赖追踪：找出哪些节点解锁了
  const unlockedNodes = useMemo(() => {
    const masteredIds = new Set(
      nodes.filter((n) => n.mastery_level && n.mastery_level >= 0.85).map((n) => n.id)
    );
    
    return nodes.map((node) => {
      const prereqs = node.prerequisites || [];
      const allPrereqsMet = prereqs.length === 0 || prereqs.every((p) => masteredIds.has(p));
      return { ...node, unlocked: allPrereqsMet };
    });
  }, [nodes]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">学习进度</h1>
              <p className="text-gray-500">
                {stats.total} 个知识点 · 平均掌握度 {Math.round(stats.avgMastery * 100)}%
              </p>
            </div>
            <Link
              href="/"
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
            >
              返回首页
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* 统计卡片 */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <StatCard 
            label="总知识点" 
            value={stats.total} 
            icon="📚" 
            color="blue"
          />
          <StatCard 
            label="已掌握" 
            value={stats.mastered} 
            icon="✅" 
            color="green"
            subLabel={`${Math.round((stats.mastered / stats.total) * 100) || 0}%`}
          />
          <StatCard 
            label="学习中" 
            value={stats.learning} 
            icon="📖" 
            color="yellow"
          />
          <StatCard 
            label="未开始" 
            value={stats.notStarted} 
            icon="⏳" 
            color="gray"
          />
        </div>

        {/* 筛选器 */}
        <div className="flex gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">学科</label>
            <select
              value={subjectFilter}
              onChange={(e) => {
                setSubjectFilter(e.target.value);
                setChapterFilter('all');
              }}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {subjects.map((s) => (
                <option key={s} value={s}>
                  {s === 'all' ? '全部学科' : s === 'math' ? '数学' : s}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">章节</label>
            <select
              value={chapterFilter}
              onChange={(e) => setChapterFilter(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={subjectFilter === 'all' && chapters.length <= 1}
            >
              {chapters.map((c) => (
                <option key={c} value={c}>
                  {c === 'all' ? '全部章节' : c}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-6">
          {/* DAG 图谱 */}
          <div className="flex-1">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-medium text-gray-700 mb-4">知识图谱</h2>
              
              <div className="space-y-6">
                {groupedNodes.map(([chapter, chapterNodes]) => (
                  <div key={chapter}>
                    <h3 className="text-sm font-medium text-gray-500 mb-3">{chapter}</h3>
                    <div className="flex flex-wrap gap-3">
                      {chapterNodes.map((node) => {
                        const { status, mastery } = getNodeLabel(node);
                        const isUnlocked = unlockedNodes.find((n) => n.id === node.id)?.unlocked;
                        const isLocked = !isUnlocked;
                        
                        return (
                          <button
                            key={node.id}
                            onClick={() => setSelectedNode(node)}
                            className={`
                              relative px-4 py-3 rounded-lg border-2 transition-all min-w-[120px]
                              ${getNodeColor(status)}
                              ${isLocked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105'}
                              ${selectedNode?.id === node.id ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
                            `}
                            disabled={isLocked}
                          >
                            <div className="font-medium text-left">{node.title}</div>
                            <div className="flex items-center justify-between mt-1 text-xs opacity-75">
                              <span>难度 {node.difficulty}</span>
                              {mastery > 0 && <span>{mastery}%</span>}
                            </div>
                            {mastery > 0 && mastery < 85 && (
                              <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/10 rounded-b-lg overflow-hidden">
                                <div 
                                  className="h-full bg-white/50 transition-all"
                                  style={{ width: `${mastery}%` }}
                                />
                              </div>
                            )}
                            {isLocked && (
                              <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-lg">
                                <span className="text-2xl">🔒</span>
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* 图例 */}
              <div className="flex gap-6 mt-6 pt-6 border-t">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-green-500"></div>
                  <span className="text-sm text-gray-600">已掌握</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-yellow-400"></div>
                  <span className="text-sm text-gray-600">学习中</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-gray-100 border border-gray-300"></div>
                  <span className="text-sm text-gray-600">未开始</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-gray-200 flex items-center justify-center text-xs">🔒</div>
                  <span className="text-sm text-gray-600">未解锁</span>
                </div>
              </div>
            </div>
          </div>

          {/* 节点详情侧边栏 */}
          {selectedNode && (
            <div className="w-80">
              <div className="bg-white rounded-xl shadow-sm p-6 sticky top-4">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900">{selectedNode.title}</h3>
                  <button
                    onClick={() => setSelectedNode(null)}
                    className="p-1 text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4">
                  {/* 状态 */}
                  <div>
                    <div className="text-sm text-gray-500">掌握状态</div>
                    <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-1 ${
                      getNodeStatus(selectedNode) === 'mastered' 
                        ? 'bg-green-100 text-green-700' 
                        : getNodeStatus(selectedNode) === 'learning'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {getNodeStatus(selectedNode) === 'mastered' 
                        ? '✅ 已掌握' 
                        : getNodeStatus(selectedNode) === 'learning'
                        ? '📖 学习中'
                        : '⏳ 未开始'}
                    </div>
                  </div>

                  {/* 掌握度 */}
                  <div>
                    <div className="text-sm text-gray-500">掌握度</div>
                    <div className="mt-1">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all ${
                              getNodeStatus(selectedNode) === 'mastered' ? 'bg-green-500' : 'bg-yellow-400'
                            }`}
                            style={{ width: `${selectedNode.mastery_level ? selectedNode.mastery_level * 100 : 0}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">
                          {Math.round((selectedNode.mastery_level || 0) * 100)}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 先决条件 */}
                  {selectedNode.prerequisites && selectedNode.prerequisites.length > 0 && (
                    <div>
                      <div className="text-sm text-gray-500 mb-2">先决条件</div>
                      <div className="flex flex-wrap gap-2">
                        {selectedNode.prerequisites.map((prereq) => {
                          const prereqNode = nodes.find((n) => n.id === prereq);
                          const isMet = prereqNode && prereqNode.mastery_level && prereqNode.mastery_level >= 0.85;
                          return (
                            <span
                              key={prereq}
                              className={`px-2 py-1 rounded text-xs ${
                                isMet ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                              }`}
                            >
                              {prereqNode?.title || prereq} {isMet ? '✅' : '❌'}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* FSRS 状态 */}
                  {selectedNode.fsrs_state && (
                    <div>
                      <div className="text-sm text-gray-500">复习状态</div>
                      <div className="text-sm mt-1">{selectedNode.fsrs_state}</div>
                    </div>
                  )}

                  {/* 开始学习按钮 */}
                  {getNodeStatus(selectedNode) === 'not_started' && (
                    <Link
                      href={`/learn/${selectedNode.id}`}
                      className="block w-full text-center bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition"
                    >
                      开始学习
                    </Link>
                  )}
                  {getNodeStatus(selectedNode) === 'learning' && (
                    <Link
                      href={`/learn/${selectedNode.id}`}
                      className="block w-full text-center bg-yellow-500 text-white py-2 rounded-lg hover:bg-yellow-600 transition"
                    >
                      继续学习
                    </Link>
                  )}
                  {getNodeStatus(selectedNode) === 'mastered' && (
                    <Link
                      href={`/learn/${selectedNode.id}`}
                      className="block w-full text-center bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition"
                    >
                      复习一下
                    </Link>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  color,
  subLabel,
}: {
  label: string;
  value: number;
  icon: string;
  color: 'green' | 'blue' | 'yellow' | 'gray';
  subLabel?: string;
}) {
  const colorClasses = {
    green: 'bg-green-50 border-green-200',
    blue: 'bg-blue-50 border-blue-200',
    yellow: 'bg-yellow-50 border-yellow-200',
    gray: 'bg-gray-50 border-gray-200',
  };

  return (
    <div className={`p-4 rounded-xl border ${colorClasses[color]} text-center`}>
      <div className="text-2xl mb-1">{icon}</div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-sm text-gray-600">{label}</div>
      {subLabel && <div className="text-xs text-gray-500 mt-1">{subLabel}</div>}
    </div>
  );
}
