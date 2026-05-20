'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import ChatTutor from '@/components/ChatTutor';
import QuizCard, { type QuizResult } from '@/components/QuizCard';

interface NodeInfo {
  id: string;
  title: string;
  description: string;
  difficulty: number;
  estimated_minutes: number;
  chapter: string;
}

type LearnPhase = 'learn' | 'quiz' | 'summary';

export default function LearnPage() {
  const params = useParams();
  const nodeId = params.nodeId as string;
  const [node, setNode] = useState<NodeInfo | null>(null);
  const [phase, setPhase] = useState<LearnPhase>('learn');
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
    setPhase('summary');
  };

  const handleRetryQuiz = () => {
    setQuizResults([]);
    setPhase('quiz');
  };

  const handleGoHome = () => {
    window.location.href = '/';
  };

  // 计算测验统计
  const correctCount = quizResults.filter((r) => r.is_correct).length;
  const totalCount = quizResults.length;
  const accuracy = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;

  // 获取下次复习时间（模拟）
  const getNextReviewTime = () => {
    if (accuracy >= 90) return '3 天后';
    if (accuracy >= 70) return '明天';
    return '今天晚些时候';
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
            <Link href="/" className="text-sm text-gray-500 hover:text-gray-700 mb-1 block">
              ← 返回首页
            </Link>
            <h1 className="text-xl font-bold text-gray-900">{node.title}</h1>
            <p className="text-sm text-gray-500">
              {node.chapter} · 预计 {node.estimated_minutes} 分钟 · 难度 {node.difficulty}
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
              onClick={() => phase === 'quiz' || phase === 'summary' ? setPhase('quiz') : null}
              disabled={phase === 'learn'}
              className={`px-4 py-2 rounded-lg transition ${
                phase === 'quiz' || phase === 'summary'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              答题
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto p-4">
        {phase === 'learn' && (
          <div className="bg-white rounded-xl shadow-sm">
            <ChatTutor
              nodeId={nodeId}
              userId={userId}
              onComplete={handleLearnComplete}
            />
          </div>
        )}

        {phase === 'quiz' && (
          <>
            {quizQuestions.length > 0 ? (
              <QuizCard
                questions={quizQuestions}
                nodeId={nodeId}
                userId={userId}
                onComplete={handleQuizComplete}
              />
            ) : (
              <div className="bg-white rounded-xl shadow-sm p-6 text-center">
                <p className="text-gray-500 mb-4">还没有测验题</p>
                <button
                  onClick={handleLearnComplete}
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                >
                  获取测验题
                </button>
              </div>
            )}
          </>
        )}

        {phase === 'summary' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="text-center mb-8">
              <div className="text-4xl mb-4">
                {accuracy >= 80 ? '🎉' : accuracy >= 60 ? '👍' : '💪'}
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {accuracy >= 80 ? '太棒了！' : accuracy >= 60 ? '不错！' : '继续加油！'}
              </h2>
              <p className="text-gray-500">
                {accuracy >= 80
                  ? '你对这节内容掌握得很好'
                  : accuracy >= 60
                  ? '基础不错，再巩固一下'
                  : '没关系，多复习几次就能掌握'}
              </p>
            </div>

            {/* 测验结果统计 */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-700 mb-4">答题结果</h3>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <div className="text-3xl font-bold text-blue-500">{accuracy}%</div>
                  <div className="text-sm text-gray-500">正确率</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <div className="text-3xl font-bold text-green-500">{correctCount}</div>
                  <div className="text-sm text-gray-500">答对</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <div className="text-3xl font-bold text-red-500">{totalCount - correctCount}</div>
                  <div className="text-sm text-gray-500">答错</div>
                </div>
              </div>

              {/* 详细结果列表 */}
              <div className="space-y-3">
                {quizResults.map((result, i) => (
                  <div
                    key={i}
                    className={`p-3 rounded-lg border ${
                      result.is_correct
                        ? 'bg-green-50 border-green-200'
                        : 'bg-red-50 border-red-200'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={result.is_correct ? 'text-green-500' : 'text-red-500'}>
                        {result.is_correct ? '✓' : '✗'}
                      </span>
                      <span className="text-sm text-gray-600">
                        第 {i + 1} 题 · {result.bloom_level === 'understand' ? '理解' : result.bloom_level === 'apply' ? '应用' : '迁移'}
                      </span>
                      {result.attempt_count > 1 && (
                        <span className="text-xs text-gray-400">(尝试 {result.attempt_count} 次)</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 下次复习 */}
            <div className="mb-8 p-4 bg-blue-50 rounded-xl text-center">
              <div className="text-sm text-blue-600 mb-1">下次复习</div>
              <div className="text-lg font-bold text-blue-800">{getNextReviewTime()}</div>
            </div>

            {/* 操作按钮 */}
            <div className="flex gap-3">
              {accuracy < 70 && (
                <button
                  onClick={handleRetryQuiz}
                  className="flex-1 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition"
                >
                  再练一次
                </button>
              )}
              <button
                onClick={handleGoHome}
                className="flex-1 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
              >
                返回首页
              </button>
            </div>

            {/* 复述环节提示 */}
            <div className="mt-6 p-4 bg-gray-50 rounded-xl">
              <h4 className="font-medium text-gray-700 mb-2">📝 用自己的话讲一遍</h4>
              <p className="text-sm text-gray-600 mb-2">
                试着闭上眼睛，用自己的话说说这节课学了什么。如果能讲清楚，说明你真的懂了。
              </p>
              <div className="text-sm text-gray-500 italic">
                "这节课我学到了...做...的方法是..."
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
