'use client';

import { useState } from 'react';
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
  onComplete: (results: QuizResult[]) => void;
}

export interface QuizResult {
  question: string;
  bloom_level: string;
  student_answer: string;
  is_correct: boolean;
  attempt_count: number;
}

export default function QuizCard({ questions, onComplete }: QuizCardProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [results, setResults] = useState<QuizResult[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState<{ is_correct: boolean; message: string } | null>(null);

  const current = questions[currentIndex];
  const isLast = currentIndex === questions.length - 1;

  const handleSubmit = async () => {
    if (!answer.trim()) return;

    // 调用 evaluate API
    const response = await fetch('/api/evaluate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question: current.question,
        correctAnswer: current.answer,
        answerExplanation: current.answer_explanation,
        studentAnswer: answer,
        commonMistakes: current.common_mistakes,
        attemptCount: 1,
        timeSpentSeconds: 30,
        isLastQuestionOfNode: isLast,
      }),
    });

    const data = await response.json();
    const result: QuizResult = {
      question: current.question,
      bloom_level: current.bloom_level,
      student_answer: answer,
      is_correct: data.evaluation.is_correct,
      attempt_count: 1,
    };

    setResults((prev) => [...prev, result]);
    setFeedback({
      is_correct: data.evaluation.is_correct,
      message: data.evaluation.feedback_to_student,
    });
    setShowFeedback(true);
  };

  const handleNext = () => {
    if (isLast) {
      onComplete(results);
    } else {
      setCurrentIndex((prev) => prev + 1);
      setAnswer('');
      setShowFeedback(false);
      setFeedback(null);
    }
  };

  const handleRetry = () => {
    setAnswer('');
    setShowFeedback(false);
    setFeedback(null);
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="mb-4 flex justify-between items-center">
        <span className="text-gray-500">
          问题 {currentIndex + 1} / {questions.length}
        </span>
        <span
          className={`px-2 py-1 rounded text-sm ${
            current.bloom_level === 'understand'
              ? 'bg-green-100 text-green-700'
              : current.bloom_level === 'apply'
              ? 'bg-yellow-100 text-yellow-700'
              : 'bg-red-100 text-red-700'
          }`}
        >
          {current.bloom_level === 'understand'
            ? '理解'
            : current.bloom_level === 'apply'
            ? '应用'
            : '迁移'}
        </span>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 mb-4">
        <div className="prose prose-lg max-w-none mb-6">
          <ReactMarkdown
            remarkPlugins={[remarkMath]}
            rehypePlugins={[rehypeKatex]}
          >
            {current.question}
          </ReactMarkdown>
        </div>

        {!showFeedback ? (
          <>
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="输入你的答案..."
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
            />
            <div className="flex gap-2 mt-4">
              <button
                onClick={handleSubmit}
                disabled={!answer.trim()}
                className="flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 transition"
              >
                提交答案
              </button>
            </div>
          </>
        ) : (
          <div
            className={`p-4 rounded-lg ${
              feedback?.is_correct ? 'bg-green-50' : 'bg-yellow-50'
            }`}
          >
            <div className="font-medium mb-2">
              {feedback?.is_correct ? '✓ 回答正确' : '✗ 回答错误'}
            </div>
            <p className="text-gray-700">{feedback?.message}</p>

            {!feedback?.is_correct && (
              <button
                onClick={handleRetry}
                className="mt-4 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition"
              >
                再试一次
              </button>
            )}
          </div>
        )}
      </div>

      {showFeedback && (
        <button
          onClick={handleNext}
          className="w-full bg-gray-800 text-white py-3 rounded-lg hover:bg-gray-900 transition"
        >
          {isLast ? '完成测验' : '下一题'}
        </button>
      )}
    </div>
  );
}