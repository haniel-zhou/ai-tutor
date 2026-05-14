'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import ChatTutor from '@/components/ChatTutor';
import QuizCard, { type QuizResult } from '@/components/QuizCard';

interface NodeInfo {
  id: string;
  title: string;
  description: string;
  difficulty: number;
  estimated_minutes: number;
}

export default function LearnPage() {
  const params = useParams();
  const nodeId = params.nodeId as string;
  const [node, setNode] = useState<NodeInfo | null>(null);
  const [phase, setPhase] = useState<'learn' | 'quiz'>('learn');
  const [quizQuestions, setQuizQuestions] = useState<any[]>([]);
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);
  const userId = 'mattaniah';

  useEffect(() => {
    // 获取节点信息
    fetch(`/api/nodes/${nodeId}`)
      .then((res) => res.json())
      .then((data) => setNode(data.node))
      .catch(console.error);
  }, [nodeId]);

  const handleLearnComplete = async () => {
    // 获取测验题
    try {
      const res = await fetch('/api/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, nodeId }),
      });
      const data = await res.json();
      setQuizQuestions(data.questions || []);
      setPhase('quiz');
    } catch (err) {
      console.error('Failed to load quiz:', err);
    }
  };

  const handleQuizComplete = (results: QuizResult[]) => {
    setQuizResults(results);
    // 可以跳转到下一节点或显示总结
    alert(`测验完成！答对 ${results.filter((r) => r.is_correct).length}/${results.length} 题`);
  };

  if (!node) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">加载中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{node.title}</h1>
            <p className="text-sm text-gray-500">
              预计 {node.estimated_minutes} 分钟 · 难度 {node.difficulty}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPhase('learn')}
              className={`px-4 py-2 rounded-lg transition ${
                phase === 'learn'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              学习
            </button>
            <button
              onClick={() => setPhase('quiz')}
              className={`px-4 py-2 rounded-lg transition ${
                phase === 'quiz'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              答题
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto p-4">
        {phase === 'learn' ? (
          <div className="bg-white rounded-xl shadow-sm">
            <ChatTutor
              nodeId={nodeId}
              userId={userId}
              onComplete={handleLearnComplete}
            />
          </div>
        ) : quizQuestions.length > 0 ? (
          <QuizCard questions={quizQuestions} onComplete={handleQuizComplete} />
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-6 text-center">
            <p className="text-gray-500 mb-4">还没有测验题</p>
            <button
              onClick={handleLearnComplete}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
            >
              开始学习后获取测验
            </button>
          </div>
        )}
      </main>
    </div>
  );
}