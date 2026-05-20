'use client';

import { useState, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

interface Question {
  bloom_level: 'understand' | 'apply' | 'transfer';
  question: string;
  answer: string;
  answer_explanation: string;
  common_mistakes: Array<{ mistake: string; diagnosis: string }>;
  hint_if_stuck: string;
}

interface QuizCardProps {
  questions: Question[];
  nodeId: string;
  userId: string;
  onComplete: (results: QuizResult[]) => void;
}

export interface QuizResult {
  question: string;
  bloom_level: string;
  student_answer: string;
  is_correct: boolean;
  attempt_count: number;
}

interface EvaluationResult {
  is_correct: boolean;
  is_partially_correct: boolean;
  score: number;
  feedback_to_student: string;
  should_show_answer: boolean;
  should_retry: boolean;
  follow_up_question: string | null;
  error_diagnosis: {
    category: string;
    specific_issue: string;
    the_step_he_missed: string;
  } | null;
}

export default function QuizCard({ questions, nodeId, userId, onComplete }: QuizCardProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [results, setResults] = useState<QuizResult[]>([]);
  const [attemptCounts, setAttemptCounts] = useState<Record<number, number>>({});
  const [currentEval, setCurrentEval] = useState<EvaluationResult | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [phase, setPhase] = useState<'answer' | 'feedback' | 'retry' | 'answer_shown'>('answer');

  const current = questions[currentIndex];
  const currentAttempt = attemptCounts[currentIndex] || 1;
  const isLast = currentIndex === questions.length - 1;

  const handleSubmit = useCallback(async () => {
    if (!answer.trim() || isLoading) return;

    setIsLoading(true);

    try {
      const response = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          nodeId,
          bloomLevel: current.bloom_level,
          question: current.question,
          correctAnswer: current.answer,
          answerExplanation: current.answer_explanation,
          studentAnswer: answer,
          commonMistakes: current.common_mistakes,
          attemptCount: currentAttempt,
          timeSpentSeconds: 30,
          isLastQuestionOfNode: false, // 非最后一题，不触发 FSRS
        }),
      });

      const data = await response.json();
      const evalResult: EvaluationResult = data.evaluation;

      // 记录这次答题
      const result: QuizResult = {
        question: current.question,
        bloom_level: current.bloom_level,
        student_answer: answer,
        is_correct: evalResult.is_correct,
        attempt_count: currentAttempt,
      };
      setResults((prev) => [...prev, result]);
      setCurrentEval(evalResult);

      if (evalResult.is_correct) {
        // 答对了 → 显示正向反馈
        setPhase('feedback');
      } else if (evalResult.should_retry) {
        // 需要重试 → 显示引导问题
        setPhase('retry');
        setAttemptCounts((prev) => ({ ...prev, [currentIndex]: currentAttempt + 1 }));
      } else {
        // 不需要重试 → 显示答案
        setPhase('answer_shown');
      }
    } catch (err) {
      console.error('Evaluation error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [answer, currentAttempt, current, currentIndex, isLoading, nodeId, userId]);

  const handleRetry = useCallback(() => {
    setAnswer('');
    setPhase('answer');
    setShowHint(false);
  }, []);

  const handleShowHint = useCallback(() => {
    setShowHint(true);
  }, []);

  const handleNext = useCallback(() => {
    if (isLast) {
      onComplete(results);
    } else {
      setCurrentIndex((prev) => prev + 1);
      setAnswer('');
      setPhase('answer');
      setShowHint(false);
      setCurrentEval(null);
    }
  }, [isLast, results, onComplete]);

  const getBloomLabel = (level: string) => {
    switch (level) {
      case 'understand': return '理解';
      case 'apply': return '应用';
      case 'transfer': return '迁移';
      default: return level;
    }
  };

  const getBloomColor = (level: string) => {
    switch (level) {
      case 'understand': return 'bg-green-100 text-green-700';
      case 'apply': return 'bg-yellow-100 text-yellow-700';
      case 'transfer': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      {/* 进度条 */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-500">
            问题 {currentIndex + 1} / {questions.length}
          </span>
          <span className={`px-2 py-1 rounded text-sm ${getBloomColor(current.bloom_level)}`}>
            {getBloomLabel(current.bloom_level)}
          </span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 transition-all"
            style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* 题目卡片 */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-4">
        <div className="prose prose-lg max-w-none mb-6">
          <ReactMarkdown
            remarkPlugins={[remarkMath]}
            rehypePlugins={[rehypeKatex]}
          >
            {current.question}
          </ReactMarkdown>
        </div>

        {/* 答题阶段 */}
        {(phase === 'answer' || phase === 'retry') && (
          <>
            {/* 提示按钮（第一次答题时显示） */}
            {phase === 'answer' && currentAttempt === 1 && !showHint && (
              <button
                onClick={handleShowHint}
                className="mb-4 text-sm text-blue-500 hover:text-blue-600"
              >
                💡 需要一点提示吗？
              </button>
            )}

            {/* 提示内容 */}
            {showHint && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="text-sm text-blue-800">
                  <span className="font-medium">提示：</span>
                  {current.hint_if_stuck}
                </div>
              </div>
            )}

            {/* 引导问题（重试时显示） */}
            {phase === 'retry' && currentEval?.follow_up_question && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="text-sm text-yellow-800">
                  <span className="font-medium">想一想：</span>
                  {currentEval.follow_up_question}
                </div>
              </div>
            )}

            {/* 重试计数 */}
            {phase === 'retry' && (
              <div className="mb-4 text-sm text-yellow-600">
                这是你的第 {currentAttempt} 次尝试，再想想看～
              </div>
            )}

            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder={phase === 'retry' ? '重新写一下你的答案...' : '输入你的答案...'}
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
            />
            <div className="flex gap-2 mt-4">
              <button
                onClick={handleSubmit}
                disabled={!answer.trim() || isLoading}
                className="flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 transition"
              >
                {isLoading ? '判分中...' : '提交答案'}
              </button>
              {phase === 'retry' && (
                <button
                  onClick={() => setPhase('answer_shown')}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                >
                  放弃，看答案
                </button>
              )}
            </div>
          </>
        )}

        {/* 答对反馈 */}
        {phase === 'feedback' && currentEval && (
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">🎉</span>
              <span className="font-medium text-green-800">回答正确！</span>
            </div>
            <p className="text-green-700">{currentEval.feedback_to_student}</p>
          </div>
        )}

        {/* 显示答案 */}
        {phase === 'answer_shown' && (
          <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
            <div className="mb-3">
              <div className="text-sm text-gray-500 mb-1">正确答案：</div>
              <div className="prose prose-sm max-w-none text-gray-900">
                <ReactMarkdown
                  remarkPlugins={[remarkMath]}
                  rehypePlugins={[rehypeKatex]}
                >
                  {current.answer}
                </ReactMarkdown>
              </div>
            </div>
            <div className="border-t border-gray-200 pt-3">
              <div className="text-sm text-gray-500 mb-1">解释：</div>
              <p className="text-gray-700">{current.answer_explanation}</p>
            </div>
            {currentEval?.error_diagnosis && (
              <div className="mt-3 p-3 bg-yellow-50 rounded-lg">
                <div className="text-sm font-medium text-yellow-800">错因分析：</div>
                <p className="text-sm text-yellow-700 mt-1">
                  {currentEval.error_diagnosis.specific_issue}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 下一题 / 完成按钮 */}
      {(phase === 'feedback' || phase === 'answer_shown') && (
        <button
          onClick={handleNext}
          className="w-full bg-gray-800 text-white py-3 rounded-lg hover:bg-gray-900 transition"
        >
          {isLast ? '完成测验' : '下一题 →'}
        </button>
      )}

      {/* 答题历史（已答对的题目） */}
      {results.length > 0 && currentIndex > 0 && (
        <div className="mt-6 pt-6 border-t">
          <h3 className="text-sm font-medium text-gray-700 mb-2">已答题</h3>
          <div className="space-y-2">
            {results.slice(0, currentIndex).map((r, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <span className={r.is_correct ? 'text-green-500' : 'text-red-500'}>
                  {r.is_correct ? '✓' : '✗'}
                </span>
                <span className="text-gray-600">{getBloomLabel(r.bloom_level)}</span>
                <span className="text-gray-400">·</span>
                <span className="text-gray-500 truncate flex-1">{r.question.slice(0, 30)}...</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
