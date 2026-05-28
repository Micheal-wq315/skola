import { AppHeaderContent } from "@/app/shell/Header/Header";
import { AppBreadcrumbs } from "@/components/AppBreadcrumbs";
import { Button } from "@/components/ui/Button";
import { Paper } from "@/components/ui/Paper";
import { Progress } from "@/components/ui/Progress";
import { useLocalStorage } from "@/lib/hooks/useLocalStorage";
import {
  IconArrowLeft,
  IconCards,
  IconCheck,
  IconReload,
  IconX,
} from "@tabler/icons-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { chapterNames, FD } from "../quiz/quizData";
import "./FlashView.css";

const BASE = "flash-view";

interface CardState {
  level: number;
  active: boolean;
}

interface ChapterState {
  d: number;
  cards: CardState[];
}

type FlashProgress = Record<number, ChapterState>;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const MASTERY_THRESHOLD = 3;

function AnswerWithExtra({ content }: { content: string }) {
  const parts = content.split("\n\n💡 补充知识：");
  const answer = parts[0];
  const extra = parts[1];

  return (
    <>
      <div className={`${BASE}__card-text ${BASE}__card-text--answer`}>
        {answer}
      </div>
      {extra && (
        <div className={`${BASE}__card-extra`}>
          💡 补充知识：
          <br />
          {extra}
        </div>
      )}
    </>
  );
}

export default function FlashView() {
  const [progress, setProgress] = useLocalStorage<FlashProgress>("flash-progress", {});
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
  const [deck, setDeck] = useState<{ card: typeof FD[0]; index: number }[] | null>(null);
  const [cardIndex, setCardIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [animOut, setAnimOut] = useState<"yes" | "no" | null>(null);
  const [finished, setFinished] = useState(false);

  const chapterCards = useMemo(() => {
    if (selectedChapter === null) return [];
    return FD.filter((c) => c.ch === selectedChapter);
  }, [selectedChapter]);

  const initDeck = useCallback(() => {
    if (selectedChapter === null) return;
    const cards = chapterCards;
    const saved = progress[selectedChapter];
    const cardStates = saved?.cards ?? cards.map(() => ({ level: 0, active: true }));

    const pool = cards
      .map((card, i) => ({ card, index: i, state: cardStates[i] }))
      .filter((item) => item.state.active)
      .sort((a, b) => a.state.level - b.state.level);

    const shuffled = shuffle(pool);
    setDeck(shuffled.map((item) => ({ card: item.card, index: item.index })));
    setCardIndex(0);
    setFlipped(false);
    setAnimOut(null);
    setFinished(false);
  }, [selectedChapter, chapterCards, progress]);

  useEffect(() => {
    if (selectedChapter !== null && !deck) {
      initDeck();
    }
  }, [selectedChapter, deck, initDeck]);

  const currentCard = deck && cardIndex < deck.length ? deck[cardIndex] : null;

  const flipCard = () => {
    if (animOut || finished) return;
    setFlipped(true);
  };

  const answerCard = (known: boolean) => {
    if (!currentCard || animOut || !selectedChapter) return;
    const dir = known ? "yes" : "no";
    setAnimOut(dir);

    setTimeout(() => {
      const saved = progress[selectedChapter];
      const cards = saved?.cards ?? chapterCards.map(() => ({ level: 0, active: true }));

      const upd = [...cards];
      const entry = upd[currentCard.index] ?? { level: 0, active: true };
      const newLevel = known ? entry.level + 1 : Math.max(0, entry.level - 1);
      const active = newLevel < MASTERY_THRESHOLD;
      upd[currentCard.index] = { level: newLevel, active };

      const mastered = upd.filter((c) => !c.active).length;
      const newProgress = {
        ...progress,
        [selectedChapter]: { d: mastered, cards: upd },
      };
      setProgress(newProgress);

      setFlipped(false);
      setAnimOut(null);

      const nextIdx = cardIndex + 1;
      if (nextIdx >= deck!.length) {
        initDeck();
        if (deck!.length <= 1) {
          setFinished(true);
        }
      } else {
        setCardIndex(nextIdx);
      }
    }, 350);
  };

  const backToList = () => {
    setSelectedChapter(null);
    setDeck(null);
    setCardIndex(0);
    setFlipped(false);
    setAnimOut(null);
    setFinished(false);
  };

  const restartChapter = () => {
    if (!selectedChapter) return;
    const cards = chapterCards.map(() => ({ level: 0, active: true }));
    const newProgress = {
      ...progress,
      [selectedChapter]: { d: 0, cards },
    };
    setProgress(newProgress);
    const pool = shuffle(
      chapterCards.map((card, i) => ({ card, index: i }))
    );
    setDeck(pool);
    setCardIndex(0);
    setFlipped(false);
    setAnimOut(null);
    setFinished(false);
  };

  if (selectedChapter === null) {
    return (
      <>
        <AppHeaderContent>
          <AppBreadcrumbs />
        </AppHeaderContent>
        <div className={BASE}>
          <div className={`${BASE}__hero`}>
            <IconCards size={40} className={`${BASE}__hero-icon`} />
            <h1 className={`${BASE}__title`}>知识点速记</h1>
            <p className={`${BASE}__subtitle`}>
              翻转卡片记忆 · 每张卡片需连续答对 {MASTERY_THRESHOLD} 次方可掌握
            </p>
          </div>
          <div className={`${BASE}__chapter-list`}>
            {Object.entries(chapterNames).map(([ch, name]) => {
              const chNum = Number(ch);
              const cards = FD.filter((c) => c.ch === chNum);
              const saved = progress[chNum];
              const total = cards.length;
              const mastered = saved?.d ?? 0;
              const pct = total ? Math.round((mastered / total) * 100) : 0;
              return (
                <Paper
                  key={ch}
                  withBorder
                  className={`${BASE}__chapter-card`}
                  onClick={() => setSelectedChapter(chNum)}
                >
                  <div className={`${BASE}__chapter-num`}>{ch}</div>
                  <div className={`${BASE}__chapter-info`}>
                    <div className={`${BASE}__chapter-name`}>{name}</div>
                    <div className={`${BASE}__chapter-meta`}>
                      {total} 张卡片
                      {saved ? ` · 掌握 ${mastered}/${total} (${pct}%)` : " · 未开始"}
                    </div>
                  </div>
                  {pct === 100 && (
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

  if (finished || (deck && deck.length === 0)) {
    const cards = chapterCards;
    const saved = progress[selectedChapter];
    const total = cards.length;
    const mastered = saved?.d ?? 0;
    return (
      <>
        <AppHeaderContent>
          <AppBreadcrumbs />
        </AppHeaderContent>
        <div className={BASE}>
          <div className={`${BASE}__done`}>
            <div className={`${BASE}__done-icon`}>
              <IconCheck size={48} />
            </div>
            <h2 className={`${BASE}__done-title`}>本章已全部掌握</h2>
            <p className={`${BASE}__done-text`}>
              第{selectedChapter}章 {chapterNames[selectedChapter]}
              {" · "}
              掌握 {mastered}/{total} 张卡片
            </p>
            <div className={`${BASE}__done-actions`}>
              <Button onClick={backToList} leftSection={<IconArrowLeft />}>
                返回章节列表
              </Button>
              <Button
                onClick={restartChapter}
                leftSection={<IconReload />}
                variant="primary"
              >
                重新记忆
              </Button>
            </div>
          </div>
        </div>
      </>
    );
  }

  const totalCards = chapterCards.length;
  const saved = progress[selectedChapter];
  const masteredCount = saved?.d ?? 0;
  const remainingInDeck = deck?.length ?? 0;

  return (
    <>
      <AppHeaderContent>
        <AppBreadcrumbs />
      </AppHeaderContent>
      <div className={BASE}>
        <div className={`${BASE}__session-header`}>
          <Button onClick={backToList} variant="ghost" leftSection={<IconArrowLeft />}>
            返回
          </Button>
          <div className={`${BASE}__session-info`}>
            第{selectedChapter}章 {chapterNames[selectedChapter]}
          </div>
        </div>

        <div className={`${BASE}__stats-row`}>
          <div className={`${BASE}__stat`}>
            <span className={`${BASE}__stat-val`}>{masteredCount}</span>
            <span className={`${BASE}__stat-label`}>已掌握</span>
          </div>
          <div className={`${BASE}__stat ${BASE}__stat--active`}>
            <span className={`${BASE}__stat-val`}>{remainingInDeck}</span>
            <span className={`${BASE}__stat-label`}>剩余</span>
          </div>
          <div className={`${BASE}__stat`}>
            <span className={`${BASE}__stat-val`}>{totalCards}</span>
            <span className={`${BASE}__stat-label`}>总计</span>
          </div>
        </div>

        <div className={`${BASE}__progress-row`}>
          <Progress value={(masteredCount / totalCards) * 100} size="sm" />
        </div>

        {currentCard && (
          <div className={`${BASE}__card-stage`}>
            <div className={`${BASE}__card-counter`}>
              第 {cardIndex + 1}/{remainingInDeck} 张
            </div>
            <div
              className={`${BASE}__card-wrap ${flipped ? `${BASE}__card-wrap--flipped` : ""} ${animOut ? `${BASE}__card-wrap--exit-${animOut}` : ""}`}
            >
              <div className={`${BASE}__card-inner`}>
                <Paper
                  withBorder
                  withTexture
                  className={`${BASE}__card ${BASE}__card--front`}
                  onClick={flipCard}
                >
                  <div className={`${BASE}__card-label`}>点击翻转查看答案</div>
                  <div className={`${BASE}__card-text`}>{currentCard.card.q}</div>
                </Paper>
                <Paper
                  withBorder
                  className={`${BASE}__card ${BASE}__card--back`}
                >
                  <div className={`${BASE}__card-label`}>答案</div>
                  <AnswerWithExtra content={currentCard.card.a} />
                </Paper>
              </div>
            </div>
          </div>
        )}

        <div className={`${BASE}__actions`}>
          <button
            type="button"
            className={`${BASE}__btn ${BASE}__btn--no`}
            onClick={() => answerCard(false)}
            disabled={!flipped || !!animOut}
          >
            <IconX size={22} />
            <span>没记住</span>
          </button>
          <button
            type="button"
            className={`${BASE}__btn ${BASE}__btn--yes`}
            onClick={() => answerCard(true)}
            disabled={!flipped || !!animOut}
          >
            <IconCheck size={22} />
            <span>记住了</span>
          </button>
        </div>

        <div className={`${BASE}__hint`}>
          点击卡片翻转 · 翻转后选择掌握程度 · 连续答对 {MASTERY_THRESHOLD} 次即可掌握
        </div>
      </div>
    </>
  );
}
