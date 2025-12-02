import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Chess, Square, PieceSymbol } from "chess.js";
import { Link, useSearchParams } from "react-router-dom";
import Chessground from "@react-chess/chessground";
import parseLines from "./PgnParser";

import { Opening, Key, OpeningAnnotation } from "./Types";

type PracticeMode = "random" | "sequential";

const startingFen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq";

const depthPresets: Array<{ label: string; value: number }> = [
  { label: "6 moves", value: 6 },
  { label: "10 moves", value: 10 },
  { label: "14 moves", value: 14 },
  { label: "Full line", value: 0 },
];

function Practice(props: {
  openings: Opening[];
  setOpenings: any;
}): JSX.Element {
  const moveDelay = 150;

  const [searchParams] = useSearchParams();

  const openingName = searchParams.get("");
  const normalizedName = openingName?.replace("_", " ");
  const opening =
    props.openings.find((item) => item.name === normalizedName) ??
    props.openings[0];

  const lines = useMemo(() => parseLines(opening.pgn), [opening.pgn]);

  const [practiceMode, setPracticeMode] = useState<PracticeMode>("random");
  const [maxDepth, setMaxDepth] = useState<number>(10);
  const [fen, setFen] = useState(startingFen);
  const [line, setLine] = useState<string[]>(
    () => (lines.length > 0 ? lines[0] : [])
  );
  const [index, setIndex] = useState(0);
  const [correct, setCorrect] = useState<any[]>([]);
  const [attempts, setAttempts] = useState(0);
  const [firstTryCount, setFirstTryCount] = useState(0);
  const [totalDepth, setTotalDepth] = useState(0);

  const sequenceRef = useRef(0);
  const attemptTracker = useRef({ moves: 0, mistakes: false });
  const fenRef = useRef(startingFen);
  const pathRef = useRef<string[]>([]);

  const annotationMap = useMemo(() => {
    const map = new Map<string, OpeningAnnotation>();

    (opening.annotations ?? []).forEach((annotation) => {
      map.set(annotation.path.join(" "), annotation);
    });

    return map;
  }, [opening.annotations]);

  const [annotationExpanded, setAnnotationExpanded] = useState(false);

  const currentAnnotation = annotationMap.get(pathRef.current.join(" "));

  useEffect(() => {
    if (currentAnnotation) {
      setAnnotationExpanded(true);
    } else {
      setAnnotationExpanded(false);
    }
  }, [currentAnnotation]);

  useEffect(() => {
    fenRef.current = fen;
  }, [fen]);

  const selectNextLine = useCallback((): string[] => {
    if (lines.length === 0) {
      return [];
    }

    if (practiceMode === "random") {
      return lines[Math.floor(Math.random() * lines.length)];
    }

    const pointer = sequenceRef.current % lines.length;
    const selectedLine = lines[pointer];
    sequenceRef.current = pointer + 1;
    return selectedLine;
  }, [lines, practiceMode]);

  const practiceLine = useMemo(() => {
    if (maxDepth === 0) {
      return line;
    }

    return line.slice(0, maxDepth);
  }, [line, maxDepth]);

  const averageDepth =
    attempts === 0 ? 0 : Number((totalDepth / attempts).toFixed(1));

  const resetStats = useCallback(() => {
    setAttempts(0);
    setFirstTryCount(0);
    setTotalDepth(0);
    attemptTracker.current = { moves: 0, mistakes: false };
  }, []);

  const finalizeAttempt = useCallback(() => {
    const { moves, mistakes } = attemptTracker.current;

    if (moves === 0) {
      attemptTracker.current = { moves: 0, mistakes: false };
      return;
    }

    setAttempts((prev) => prev + 1);
    setTotalDepth((prev) => prev + moves);
    if (!mistakes) {
      setFirstTryCount((prev) => prev + 1);
    }

    attemptTracker.current = { moves: 0, mistakes: false };
  }, []);

  const startNewLine = useCallback(
    ({
      preserveLine = false,
      recordAttempt = true,
    }: { preserveLine?: boolean; recordAttempt?: boolean } = {}) => {
      if (recordAttempt) {
        finalizeAttempt();
      } else {
        attemptTracker.current = { moves: 0, mistakes: false };
      }

      setFen(startingFen);
      setIndex(0);
      setCorrect([]);
      pathRef.current = [];

      if (!preserveLine) {
        setLine(selectNextLine());
      }
    },
    [finalizeAttempt, selectNextLine]
  );

  useEffect(() => {
    sequenceRef.current = 0;
    startNewLine({ recordAttempt: false });
    resetStats();
  }, [opening.id, resetStats, startNewLine]);

  useEffect(() => {
    sequenceRef.current = 0;
    startNewLine({ recordAttempt: false });
  }, [practiceMode, startNewLine]);

  useEffect(() => {
    startNewLine({ preserveLine: true, recordAttempt: false });
  }, [maxDepth, startNewLine]);

  const makeAMove = useCallback(
    (move: { from: Square; to: Square; promotion: PieceSymbol } | string) => {
    setCorrect([]);

      const game = new Chess(fenRef.current);

    try {
      game.move(move);
    } catch {
        return false;
      }

      const expectedMove = practiceLine[index];

      if (!expectedMove) {
        startNewLine({ recordAttempt: false });
      return false;
    }

      if (game.history()[0] === expectedMove) {
        attemptTracker.current.moves += 1;
        setFen(game.fen());
        pathRef.current = [...pathRef.current, expectedMove];
      } else {
        const testGame = new Chess(fenRef.current);
        try {
          testGame.move(expectedMove);
      const correctMove = testGame.history({ verbose: true })[0].lan;

      setCorrect([
        {
          orig: correctMove.slice(0, 2),
          dest: correctMove.slice(2, 4),
          brush: "green",
        },
      ]);
        } catch {
          // ignore highlight errors
        }

        attemptTracker.current.mistakes = true;
        return false;
      }

      return true;
    },
    [index, practiceLine, startNewLine]
  );

  const makeAMoveLoose = useCallback((move: string) => {
    const game = new Chess(fenRef.current);

    try {
      game.move(move);
      setFen(game.fen());
      const history = game.history();
      const san =
        typeof move === "string"
          ? move
          : history[history.length - 1];
      if (san) {
        pathRef.current = [...pathRef.current, san];
      }
      return true;
    } catch {
      return false;
    }
  }, []);

  const handleLineCompletion = useCallback(() => {
    finalizeAttempt();
    setTimeout(() => {
      startNewLine({ recordAttempt: false });
    }, 1000);
  }, [finalizeAttempt, startNewLine]);

  const lineMove = useCallback(() => {
    if (practiceLine.length === 0) {
      return;
    }

    setIndex((prev) => {
      if (prev + 1 >= practiceLine.length) {
        handleLineCompletion();
        return prev;
      }

      const replyMove = practiceLine[prev + 1];
      makeAMoveLoose(replyMove);
      return prev + 2;
    });
  }, [handleLineCompletion, makeAMoveLoose, practiceLine]);

  const onDrop = useCallback(
    (sourceSquare: Key, targetSquare: Key) => {
      if (practiceLine.length === 0) {
        return false;
      }

      const move = makeAMove({
        from: sourceSquare as Square,
        to: targetSquare as Square,
        promotion: "q",
      });

      if (move === false) {
        return false;
      }

    setTimeout(lineMove, moveDelay);
    return true;
    },
    [lineMove, makeAMove, practiceLine]
  );

  useEffect(() => {
    if (opening.side !== "black" || index !== 0 || practiceLine.length === 0) {
      return;
    }

    const timer = setTimeout(() => {
      if (makeAMoveLoose(practiceLine[0])) {
        setIndex(1);
      }
    }, moveDelay * 3);

    return () => clearTimeout(timer);
  }, [index, makeAMoveLoose, opening.side, practiceLine]);

  const validMoves = useMemo(() => {
    const currentGame = new Chess(fen);
    const possibleMoves = currentGame.moves({ verbose: true });
    const lanMap = new Map<Key, Key[]>();

    for (const move of possibleMoves) {
      const startMove = move.lan.slice(0, 2) as Key;
      const endMove = move.lan.slice(2, 4) as Key;

      if (lanMap.has(startMove)) {
        lanMap.set(startMove, [...(lanMap.get(startMove) as Key[]), endMove]);
      } else {
        lanMap.set(startMove, [endMove]);
      }
    }

    return lanMap;
  }, [fen]);

  const practiceDisabled = practiceLine.length === 0;
  const ecoCode = opening.metadata?.eco;
  const openingTags = opening.tags ?? [];

  return (
    <div className="flex flex-col min-h-screen bg-blue-400 select-none">
      <div className="content-center mx-auto mt-4 mb-0">
        <div className="rounded-lg bg-blue-100">
          <h1 className="text-center px-20 py-2 text-3xl">{opening.name}</h1>
        </div>
      </div>

      <div className="w-5/6 xl:w-2/5 lg:w-2/5 mx-auto mt-4">
        <div className="rounded-lg bg-white/80 text-blue-900 p-4 shadow-sm">
          <div className="flex flex-wrap gap-2 mb-2">
            {ecoCode && (
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-900">
                ECO {ecoCode}
              </span>
            )}
            {openingTags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
              >
                {tag}
              </span>
            ))}
          </div>
          {opening.summary ? (
            <p className="text-base leading-relaxed">{opening.summary}</p>
          ) : (
            <p className="text-sm text-blue-700">
              Add a short description in edit mode to see key ideas here.
            </p>
          )}
        </div>
      </div>

      <div className="w-5/6 xl:w-2/5 lg:w-2/5 mx-auto mt-4 mb-2">
        <div className="rounded-lg bg-blue-100 p-4 flex flex-col gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide pb-1">
              Practice Mode
            </p>
            <div className="flex flex-wrap gap-2">
              {(["random", "sequential"] as PracticeMode[]).map((mode) => (
                <button
                  key={mode}
                  className={`px-4 py-2 rounded-full border text-sm font-semibold transition ${
                    practiceMode === mode
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-200"
                  }`}
                  onClick={() => setPracticeMode(mode)}
                  aria-pressed={practiceMode === mode}
                >
                  {mode === "random" ? "Random lines" : "Sequential order"}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide pb-1">
              Max Depth
            </p>
            <div className="flex flex-wrap gap-2">
              {depthPresets.map((preset) => (
                <button
                  key={preset.value}
                  className={`px-4 py-2 rounded-full border text-sm transition ${
                    maxDepth === preset.value
                      ? "bg-emerald-200 border-emerald-600 text-emerald-900"
                      : "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-200"
                  }`}
                  onClick={() => setMaxDepth(preset.value)}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="w-5/6 xl:w-2/5 lg:w-2/5 mx-auto my-4">
        {practiceDisabled && (
          <div className="rounded-lg bg-yellow-100 text-yellow-900 p-4 text-center mb-4">
            Add PGN lines to this repertoire to start practicing.
          </div>
        )}
        <div
          className="relative aspect-square rounded-lg bg-blue-200 p-2"
          onContextMenu={(e) => e.preventDefault()}
        >
          {currentAnnotation && (
            <button
              className={`absolute top-3 right-3 rounded-full px-3 py-2 text-xs font-semibold shadow ${
                annotationExpanded
                  ? "bg-blue-600 text-white"
                  : "bg-white/80 text-blue-700"
              }`}
              onClick={() => setAnnotationExpanded((prev) => !prev)}
              aria-pressed={annotationExpanded}
              aria-label="Toggle position explanation"
            >
              Idea
            </button>
          )}
          <Chessground
            contained={true}
            config={{
              fen: fen,
              events: { move: onDrop },
              highlight: { lastMove: false, check: true },
              movable: {
                dests: validMoves,
                showDests: true,
              },
              animation: {
                enabled: true,
                duration: 250,
              },
              drawable: {
                enabled: true,
                visible: true,
                autoShapes: correct,
              },
              orientation: opening.side,
            }}
          />
        </div>
        {currentAnnotation && annotationExpanded && (
          <div className="rounded-lg bg-white/80 text-blue-900 p-4 mt-4 flex gap-3 items-start shadow-sm">
            <div className="text-3xl" aria-hidden="true">
              💡
            </div>
            <div>
              {currentAnnotation.label && (
                <p className="text-sm uppercase tracking-wide font-semibold text-blue-700 mb-1">
                  {currentAnnotation.label}
                </p>
              )}
              <p className="text-base leading-relaxed">
                {currentAnnotation.comment}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="w-5/6 xl:w-2/5 lg:w-2/5 mx-auto my-2">
        <div className="rounded-lg bg-blue-100 p-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-sm uppercase tracking-wide text-blue-700">
              Attempts
            </p>
            <p className="text-2xl font-bold">{attempts}</p>
          </div>
          <div>
            <p className="text-sm uppercase tracking-wide text-blue-700">
              First-Try Wins
            </p>
            <p className="text-2xl font-bold">{firstTryCount}</p>
          </div>
          <div>
            <p className="text-sm uppercase tracking-wide text-blue-700">
              Avg Depth
            </p>
            <p className="text-2xl font-bold">{averageDepth}</p>
          </div>
        </div>
      </div>

      <div className="text-center mx-auto mb-8">
        <Link to="/train">
          <button
            className="rounded p-2 mx-2 bg-sky-50"
            onClick={() => {
              document.body.scrollTop = document.documentElement.scrollTop = 0;
            }}
          >
            Switch Openings
          </button>
        </Link>
        <button
          className="rounded p-2 mx-2 bg-sky-50"
          onClick={() => startNewLine()}
          disabled={practiceDisabled}
        >
          Restart
        </button>
      </div>
    </div>
  );
}

export default Practice;
