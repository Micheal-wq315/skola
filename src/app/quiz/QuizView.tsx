import { AppHeaderContent } from "@/app/shell/Header/Header";
import { AppBreadcrumbs } from "@/components/AppBreadcrumbs";
import { Button } from "@/components/ui/Button";
import { Paper } from "@/components/ui/Paper";
import { Progress } from "@/components/ui/Progress";
import { useLocalStorage } from "@/lib/hooks/useLocalStorage";
import { IconArrowLeft, IconArrowRight, IconCheck, IconRefresh, IconSend, IconX } from "@tabler/icons-react";
import { useState } from "react";
import { C, chapterNames, QuizQuestion } from "./quizData";
import "./QuizView.css";

const BASE = "quiz-view";

interface QuizState {
  chapter: number;
  answers: (number[] | null)[];
  submitted: boolean;
  currentIndex: number;
}

interface QuizScores {
  [chapter: number]: { best: number; total: number };
}

export default function QuizView() {
  const [scores, setScores] = useLocalStorage<QuizScores>("quiz-scores", {});
  const [quiz, setQuiz] = useState<QuizState | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);

  const startChapter = (ch: number) => {
    const questions = C[ch]?.q ?? [];
    setSelectedChapter(ch);
    setQuiz({
      chapter: ch,
      answers: questions.map(() => null),
      submitted: false,
      currentIndex: 0,
    });
  };

  const backToList = () => {
    setSelectedChapter(null);
    setQuiz(null);
  };

  const toggleOption = (optIndex: number) => {
    if (!quiz || quiz.submitted) return;
    const q = C[quiz.chapter]?.q[quiz.currentIndex];
    if (!q) return;

    const newAnswers = [...quiz.answers];
    const current = newAnswers[quiz.currentIndex];

    if (q.type === "m") {
      const arr = current ? [...current] : [];
      const idx = arr.indexOf(optIndex);
      if (idx >= 0) arr.splice(idx, 1);
      else arr.push(optIndex);
      newAnswers[quiz.currentIndex] = arr;
    } else {
      newAnswers[quiz.currentIndex] = [optIndex];
    }
    setQuiz({ ...quiz, answers: newAnswers });
  };

  const isSelected = (optIndex: number): boolean => {
    if (!quiz) return false;
    const a = quiz.answers[quiz.currentIndex];
    return a ? a.includes(optIndex) : false;
  };

  const goTo = (idx: number) => {
    if (!quiz) return;
    if (idx < 0 || idx >= C[quiz.chapter]?.q.length) return;
    setQuiz({ ...quiz, currentIndex: idx });
  };

  const submitChapter = () => {
    if (!quiz) return;
    const questions = C[quiz.chapter]?.q;
    if (!questions) return;

    let correct = 0;
    quiz.answers.forEach((ans, i) => {
      if (!ans || ans.length === 0) return;
      const q = questions[i];
      const right = Array.isArray(q.answer) ? q.answer : [q.answer];
      if (
        ans.length === right.length &&
        ans.every((v) => right.includes(v))
      ) {
        correct++;
      }
    });

    const total = questions.length;
    const prev = scores[quiz.chapter];
    const best = prev ? Math.max(prev.best, correct) : correct;

    setScores({ ...scores, [quiz.chapter]: { best, total } });
    setQuiz({ ...quiz, submitted: true });
  };

  const retryChapter = () => {
    if (!selectedChapter) return;
    startChapter(selectedChapter);
  };

  const getUnansweredCount = () => {
    if (!quiz) return 0;
    return quiz.answers.filter((a) => !a || a.length === 0).length;
  };

  const getCorrectCount = () => {
    if (!quiz || !quiz.submitted) return 0;
    const questions = C[quiz.chapter]?.q;
    if (!questions) return 0;
    let c = 0;
    quiz.answers.forEach((ans, i) => {
      if (!ans || ans.length === 0) return;
      const right = Array.isArray(questions[i].answer)
        ? questions[i].answer
        : [questions[i].answer];
      if (
        ans.length === right.length &&
        ans.every((v) => right.includes(v))
      ) {
        c++;
      }
    });
    return c;
  };

  const isCorrect = (q: QuizQuestion, ans: number[] | null): boolean => {
    if (!ans || ans.length === 0) return false;
    const right = Array.isArray(q.answer) ? q.answer : [q.answer];
    return (
      ans.length === right.length && ans.every((v) => right.includes(v))
    );
  };

  if (!selectedChapter) {
    return (
      <>
        <AppHeaderContent>
          <AppBreadcrumbs />
        </AppHeaderContent>
        <div className={BASE}>
          <h1 className={`${BASE}__title`}>章节测试</h1>
          <p className={`${BASE}__subtitle`}>
            共 13 章 · 选择题 + 多选题 · 选完统一提交判分
          </p>
          <div className={`${BASE}__chapter-list`}>
            {Object.entries(C).map(([ch, info]) => {
              const chNum = Number(ch);
              const sc = scores[chNum];
              const pct = sc && sc.total ? Math.round((sc.best / sc.total) * 100) : 0;
              return (
                <Paper
                  key={ch}
                  withBorder
                  className={`${BASE}__chapter-card`}
                  onClick={() => startChapter(chNum)}
                >
                  <div className={`${BASE}__chapter-num`}>{ch}</div>
                  <div className={`${BASE}__chapter-info`}>
                    <div className={`${BASE}__chapter-name`}>{info.t}</div>
                    <div className={`${BASE}__chapter-meta`}>
                      {info.q.length} 题
                      {sc ? ` · 最佳 ${sc.best}/${sc.total} (${pct}%)` : " · 未测试"}
                    </div>
                  </div>
                  {sc && pct >= 80 && (
                    <div className={`${BASE}__chapter-badge`}>
                      <IconCheck size={16} />
                    </div>
                  )}
                  <div className={`${BASE}__chapter-bar`}>
                    <div
                      className={`${BASE}__chapter-bar-fill`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </Paper>
              );
            })}
          </div>
        </div>
      </>
    );
  }

  const questions = C[selectedChapter]?.q ?? [];
  const q = questions[quiz?.currentIndex ?? 0];
  const isSubmitted = quiz?.submitted ?? false;
  const correctCount = getCorrectCount();
  const totalCount = questions.length;

  if (isSubmitted) {
    return (
      <>
        <AppHeaderContent>
          <AppBreadcrumbs />
        </AppHeaderContent>
        <div className={BASE}>
          <div className={`${BASE}__result-header`}>
            <h2 className={`${BASE}__result-title`}>
              第{selectedChapter}章 {chapterNames[selectedChapter]} · 测试结果
            </h2>
            <div className={`${BASE}__result-score`}>
              <div className={`${BASE}__result-ring`}>
                <svg width="100" height="100" viewBox="0 0 100 100">
                  <circle
                    cx="50" cy="50" r="42"
                    fill="none"
                    stroke="var(--theme-neutral-200)"
                    strokeWidth="6"
                  />
                  <circle
                    cx="50" cy="50" r="42"
                    fill="none"
                    stroke={
                      correctCount / totalCount >= 0.8
                        ? "var(--theme-green-500, #3dd68c)"
                        : correctCount / totalCount >= 0.6
                          ? "var(--theme-amber-500, #f5a623)"
                          : "var(--theme-red-500, #ff6363)"
                    }
                    strokeWidth="6"
                    strokeDasharray={`${2 * Math.PI * 42}`}
                    strokeDashoffset={`${2 * Math.PI * 42 * (1 - correctCount / totalCount)}`}
                    strokeLinecap="round"
                    transform="rotate(-90 50 50)"
                  />
                </svg>
                <span className={`${BASE}__result-pct`}>
                  {Math.round((correctCount / totalCount) * 100)}%
                </span>
              </div>
              <div className={`${BASE}__result-text`}>
                {correctCount}/{totalCount} 正确
              </div>
            </div>
            <div className={`${BASE}__result-actions`}>
              <Button onClick={backToList} leftSection={<IconArrowLeft />}>
                返回章节列表
              </Button>
              <Button
                onClick={retryChapter}
                leftSection={<IconRefresh />}
                variant="primary"
              >
                重做本章
              </Button>
            </div>
          </div>
          <div className={`${BASE}__result-list`}>
            {questions.map((question, i) => {
              const correct = isCorrect(question, quiz?.answers[i] ?? null);
              return (
                <Paper
                  key={i}
                  withBorder
                  className={`${BASE}__result-item ${correct ? `${BASE}__result-item--correct` : `${BASE}__result-item--wrong`}`}
                >
                  <div className={`${BASE}__result-qnum`}>
                    {correct ? <IconCheck size={18} /> : <IconX size={18} />}
                    <span>第{i + 1}题</span>
                  </div>
                  <div className={`${BASE}__result-qtext`}>{question.text}</div>
                  <div className={`${BASE}__result-answer`}>
                    <span className={`${BASE}__result-label`}>
                      {correct ? "✓ 回答正确" : "✗ 你的答案：无"}
                    </span>
                    {!correct && quiz?.answers[i] && quiz.answers[i]!.length > 0 && (
                      <span className={`${BASE}__result-label`}>
                        ✗ 你的答案：
                        {quiz.answers[i]!
                          .map((oi) => question.opts[oi])
                          .join("、")}
                      </span>
                    )}
                    <span className={`${BASE}__result-correct`}>
                      正确答案：
                      {(Array.isArray(question.answer)
                        ? question.answer.map((ai) => question.opts[ai])
                        : [question.opts[question.answer]]
                      ).join("、")}
                    </span>
                  </div>
                  {question.hint && (
                    <div className={`${BASE}__result-hint`}>
                      💡 {question.hint}
                    </div>
                  )}
                </Paper>
              );
            })}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <AppHeaderContent>
        <AppBreadcrumbs />
      </AppHeaderContent>
      <div className={BASE}>
        <div className={`${BASE}__quiz-header`}>
          <Button onClick={backToList} variant="ghost" leftSection={<IconArrowLeft />}>
            返回
          </Button>
          <div className={`${BASE}__quiz-info`}>
            第{selectedChapter}章 {chapterNames[selectedChapter]}
          </div>
        </div>
        <div className={`${BASE}__progress-row`}>
          <Progress
            value={((quiz?.currentIndex ?? 0) + 1) / totalCount * 100}
            size="sm"
          />
          <span className={`${BASE}__progress-text`}>
            {getUnansweredCount() > 0 && `${getUnansweredCount()} 题未答 · `}
            {(quiz?.currentIndex ?? 0) + 1}/{totalCount}
          </span>
        </div>
        <div className={`${BASE}__qnav`}>
          {questions.map((_, i) => {
            const answered = quiz?.answers[i] && quiz.answers[i]!.length > 0;
            return (
              <button
                key={i}
                type="button"
                className={`${BASE}__qnav-dot ${i === quiz?.currentIndex ? `${BASE}__qnav-dot--active` : ""} ${answered ? `${BASE}__qnav-dot--done` : ""}`}
                onClick={() => goTo(i)}
              >
                {i + 1}
              </button>
            );
          })}
        </div>
        {q && (
          <Paper withBorder className={`${BASE}__question-card`}>
            <div className={`${BASE}__question-meta`}>
              {q.type === "m" ? "多选题" : "单选题"} · 第{(quiz?.currentIndex ?? 0) + 1}题
            </div>
            <div className={`${BASE}__question-text`}>{q.text}</div>
            <div className={`${BASE}__options`}>
              {q.opts.map((opt, oi) => (
                <button
                  key={oi}
                  type="button"
                  className={`${BASE}__option ${isSelected(oi) ? `${BASE}__option--selected` : ""}`}
                  onClick={() => toggleOption(oi)}
                >
                  <span className={`${BASE}__option-letter`}>
                    {String.fromCharCode(65 + oi)}
                  </span>
                  <span className={`${BASE}__option-text`}>{opt}</span>
                  {isSelected(oi) && <IconCheck size={16} />}
                </button>
              ))}
            </div>
          </Paper>
        )}
        <div className={`${BASE}__nav-buttons`}>
          <Button
            onClick={() => goTo((quiz?.currentIndex ?? 0) - 1)}
            disabled={!quiz || quiz.currentIndex === 0}
            leftSection={<IconArrowLeft />}
          >
            上一题
          </Button>
          {(quiz?.currentIndex ?? 0) === totalCount - 1 ? (
            <Button
              onClick={() => {
                const unanswered = getUnansweredCount();
                if (unanswered > 0) {
                  if (!confirm(`还有 ${unanswered} 题未作答，确定提交吗？`)) return;
                }
                submitChapter();
              }}
              variant="primary"
              leftSection={<IconSend />}
            >
              提交本章答案
            </Button>
          ) : (
            <Button
              onClick={() => goTo((quiz?.currentIndex ?? 0) + 1)}
              rightSection={<IconArrowRight />}
            >
              下一题
            </Button>
          )}
        </div>
      </div>
    </>
  );
}
