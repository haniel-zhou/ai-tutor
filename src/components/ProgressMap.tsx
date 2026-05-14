'use client';

import { useState, useEffect } from 'react';

interface Node {
  id: string;
  title: string;
  subject: string;
  chapter: string;
  difficulty: number;
  mastery_level?: number;
  is_mastered?: boolean;
}

interface ProgressMapProps {
  subject: string;
  userId: string;
  onNodeClick: (nodeId: string) => void;
}

export default function ProgressMap({ subject, userId, onNodeClick }: ProgressMapProps) {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 从 API 获取节点数据
    fetch(`/api/nodes?subject=${subject}`)
      .then((res) => res.json())
      .then((data) => {
        setNodes(data.nodes || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [subject, userId]);

  if (loading) {
    return <div className="text-center py-8">加载中...</div>;
  }

  // 按章节分组
  const chapters = nodes.reduce((acc, node) => {
    const chapter = node.chapter || '未分类';
    if (!acc[chapter]) acc[chapter] = [];
    acc[chapter].push(node);
    return acc;
  }, {} as Record<string, Node[]>);

  return (
    <div className="space-y-8">
      {Object.entries(chapters).map(([chapter, chapterNodes]) => (
        <div key={chapter}>
          <h3 className="text-lg font-medium text-gray-700 mb-4">{chapter}</h3>
          <div className="flex flex-wrap gap-3">
            {chapterNodes.map((node) => {
              const mastery = node.mastery_level || 0;
              const isMastered = node.is_mastered || mastery >= 0.85;

              return (
                <button
                  key={node.id}
                  onClick={() => onNodeClick(node.id)}
                  className={`relative px-4 py-2 rounded-lg border-2 transition-all ${
                    isMastered
                      ? 'bg-green-100 border-green-500 text-green-800'
                      : mastery > 0
                      ? 'bg-yellow-100 border-yellow-500 text-yellow-800'
                      : 'bg-gray-50 border-gray-300 text-gray-600 hover:border-blue-400'
                  }`}
                >
                  <span className="font-medium">{node.title}</span>
                  <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-gray-400 text-white text-xs flex items-center justify-center">
                    {node.difficulty}
                  </div>
                  {mastery > 0 && !isMastered && (
                    <div className="mt-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-yellow-500 transition-all"
                        style={{ width: `${mastery * 100}%` }}
                      />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}