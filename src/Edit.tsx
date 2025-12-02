import Chessground from "@react-chess/chessground";

import { useCallback, useEffect, useMemo, useState } from "react";

import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { Opening, BoardOrientation, OpeningAnnotation } from "./Types";
import { parseOpeningPgn } from "./PgnParser";

const generateAnnotationId = (): string => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `annotation-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const Edit = (props: {
  openings: Opening[];
  changeOpenings: (opening: Opening, index: number) => void;
  deleteOpenings: (index: number) => void;
}) => {
  // Allows switching pages without link
  const navigate = useNavigate();

  // Finds the opening based off the name in the url
  const [searchParams] = useSearchParams();

  const openingName = searchParams.get("");
  let opening: Opening = props.openings[0];
  let openingIndex = 0;

  if (openingName != null) {
    // Finds the opening based on name
    for (let index = 0; index < props.openings.length; index++) {
      if (props.openings[index].name === openingName.replace("_", " ")) {
        opening = props.openings[index];
        openingIndex = index;
      }
    }
  }

  const [name, setName] = useState(opening.name);
  const [summary, setSummary] = useState(opening.summary ?? "");
  const [tagInput, setTagInput] = useState((opening.tags ?? []).join(", "));
  const [fen, setFen] = useState(opening.fen);
  const [pgn, setPgn] = useState(opening.pgn);
  const [side, setSide] = useState<BoardOrientation>(opening.side);
  const [annotations, setAnnotations] = useState<OpeningAnnotation[]>(
    opening.annotations ?? []
  );
  const [selectedPath, setSelectedPath] = useState<string[] | null>(null);
  const [annotationLabel, setAnnotationLabel] = useState("");
  const [annotationComment, setAnnotationComment] = useState("");

  useEffect(() => {
    setName(opening.name);
    setSummary(opening.summary ?? "");
    setTagInput((opening.tags ?? []).join(", "));
    setFen(opening.fen);
    setPgn(opening.pgn);
    setSide(opening.side);
    setAnnotations(opening.annotations ?? []);
    setSelectedPath(null);
    setAnnotationLabel("");
    setAnnotationComment("");
  }, [opening]);

  const parsedData = useMemo(() => parseOpeningPgn(pgn), [pgn]);

  const normalizedTags = useMemo(
    () =>
      tagInput
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
    [tagInput]
  );

  const metadataEntries = useMemo(
    () =>
      Object.entries(parsedData.metadata).filter(([, value]) =>
        Boolean(value)
      ),
    [parsedData]
  );

  const pathsEqual = useCallback((a: string[], b: string[]) => {
    if (a.length !== b.length) {
      return false;
    }

    return a.every((move, index) => move === b[index]);
  }, []);

  useEffect(() => {
    if (!selectedPath) {
      setAnnotationLabel("");
      setAnnotationComment("");
      return;
    }

    const existing = annotations.find((annotation) =>
      pathsEqual(annotation.path, selectedPath)
    );

    setAnnotationLabel(existing?.label ?? "");
    setAnnotationComment(existing?.comment ?? "");
  }, [annotations, selectedPath, pathsEqual]);

  const handleSelectPath = useCallback((path: string[]) => {
    setSelectedPath([...path]);
  }, []);

  const handleAnnotationSave = useCallback(() => {
    if (!selectedPath) {
      return;
    }

    const trimmedComment = annotationComment.trim();
    const trimmedLabel = annotationLabel.trim();

    setAnnotations((prev) => {
      const existingIndex = prev.findIndex((annotation) =>
        pathsEqual(annotation.path, selectedPath)
      );

      if (!trimmedComment) {
        if (existingIndex === -1) {
          return prev;
        }

        return [
          ...prev.slice(0, existingIndex),
          ...prev.slice(existingIndex + 1),
        ];
      }

      const nextAnnotation: OpeningAnnotation = {
        id:
          existingIndex >= 0 ? prev[existingIndex].id : generateAnnotationId(),
        path: [...selectedPath],
        comment: trimmedComment,
        ...(trimmedLabel ? { label: trimmedLabel } : {}),
      };

      if (existingIndex >= 0) {
        const clone = [...prev];
        clone[existingIndex] = nextAnnotation;
        return clone;
      }

      return [...prev, nextAnnotation];
    });
  }, [annotationComment, annotationLabel, pathsEqual, selectedPath]);

  const handleAnnotationRemove = useCallback(() => {
    if (!selectedPath) {
      return;
    }

    setAnnotations((prev) =>
      prev.filter((annotation) => !pathsEqual(annotation.path, selectedPath))
    );
    setAnnotationLabel("");
    setAnnotationComment("");
  }, [pathsEqual, selectedPath]);

  const handleImportComments = useCallback(() => {
    if (parsedData.annotations.length === 0) {
      window.alert("No PGN comments were found to import.");
      return;
    }

    setAnnotations(parsedData.annotations);
  }, [parsedData]);

  const formatMoveLabel = (san: string, moveIndex: number): string => {
    const moveNumber = Math.floor(moveIndex / 2) + 1;

    if (moveIndex % 2 === 0) {
      return `${moveNumber}. ${san}`;
    }

    return san;
  };

  const formatPath = (path: string[]): string => {
    if (path.length === 0) {
      return "Starting position";
    }

    return path.join(" → ");
  };

  const fallbackTags = useMemo(() => {
    return [
      parsedData.metadata.eco,
      parsedData.metadata.opening,
      parsedData.metadata.variation,
    ]
      .map((tag) => tag?.trim())
      .filter((tag): tag is string => Boolean(tag));
  }, [parsedData]);

  const appliedTags =
    normalizedTags.length > 0 ? normalizedTags : fallbackTags;

  const uniqueTags = Array.from(new Set(appliedTags));

  const handleSave = () => {
    const trimmedSummary = summary.trim();
    const metadataForSave =
      Object.keys(parsedData.metadata).length > 0
        ? parsedData.metadata
        : opening.metadata ?? {};

    const resolvedName =
      name.trim() ||
      parsedData.metadata.opening ||
      opening.name ||
      openingIndex.toString();

    const tagsChanged =
      JSON.stringify(opening.tags ?? []) !== JSON.stringify(uniqueTags);
    const annotationsChanged =
      JSON.stringify(opening.annotations ?? []) !==
      JSON.stringify(annotations);
    const summaryChanged =
      (opening.summary ?? "") !== trimmedSummary;
    const metadataChanged =
      JSON.stringify(opening.metadata ?? {}) !==
      JSON.stringify(metadataForSave);
    const nameChanged = opening.name !== resolvedName;

    const hasUpdatedContent =
      opening.pgn !== pgn ||
      opening.fen !== fen ||
      opening.side !== side ||
      tagsChanged ||
      annotationsChanged ||
      summaryChanged ||
      metadataChanged ||
      nameChanged;

    props.changeOpenings(
      {
        ...opening,
        id: opening.id,
        name: resolvedName,
        created: hasUpdatedContent
          ? new Date().toLocaleString("default", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })
          : opening.created,
        fen,
        pgn,
        side,
        colorGroup: side,
        difficulty: opening.difficulty ?? 2,
        tags: uniqueTags,
        summary: trimmedSummary,
        annotations,
        metadata: metadataForSave,
      },
      openingIndex
    );

    document.body.scrollTop = document.documentElement.scrollTop = 0;
  };

  const Card = (): JSX.Element => {
    return (
      <div className="rounded-lg bg-blue-100 w-11/12 lg:w-3/4 xl:w-2/3 mx-auto select-none p-4">
        <div className="grid grid-cols-1 gap-4 text-left">
          <div>
            <label className="font-bold text-sm uppercase tracking-wide">
              Opening Name
            </label>
          <input
              className="mt-1 w-full py-2 px-3 rounded-lg bg-blue-50"
              value={name}
            placeholder="Enter opening name"
              onChange={(e) => setName(e.target.value.replace("_", " "))}
            />
          </div>

          <div>
            <label className="font-bold text-sm uppercase tracking-wide">
              Short Description
            </label>
            <textarea
              className="mt-1 w-full py-2 px-3 rounded-lg bg-blue-50 resize-y"
              value={summary}
              rows={3}
              placeholder="Outline key ideas, plans, or pitfalls for this repertoire."
              onChange={(e) => setSummary(e.target.value)}
            />
          </div>

          <div>
            <label className="font-bold text-sm uppercase tracking-wide">
              Tags (comma separated)
            </label>
            <input
              className="mt-1 w-full py-2 px-3 rounded-lg bg-blue-50"
              value={tagInput}
              placeholder="e4, aggressive, classical"
              onChange={(e) => setTagInput(e.target.value)}
            />
            <p className="text-xs text-blue-700 mt-1">
              Leave blank to auto-fill from PGN metadata (ECO code, variation, etc).
            </p>
          </div>

          <div>
            <label className="font-bold text-sm uppercase tracking-wide">
              Thumbnail FEN
            </label>
          <input
              className="mt-1 w-full py-2 px-3 rounded-lg bg-blue-50"
              value={fen}
            placeholder="Enter thumbnail FEN"
              onChange={(e) => setFen(e.target.value)}
            onBlur={(e) => setFen(e.target.value.split(" ")[0])}
          />
          </div>

          <div>
            <label className="font-bold text-sm uppercase tracking-wide">
              Opening PGN
            </label>
            <textarea
              className="mt-1 w-full py-2 px-3 rounded-lg bg-blue-50 resize-y"
              value={pgn}
              rows={5}
              placeholder="Paste or write your repertoire PGN here"
              onChange={(e) => setPgn(e.target.value)}
            />
            <p className="text-xs text-blue-700 mt-1">
              Comments inside &#123;&#125; will become trainable annotations.
            </p>
          </div>

          {metadataEntries.length > 0 && (
            <div className="rounded-lg bg-blue-50 p-3 text-sm text-blue-900">
              <p className="font-semibold uppercase tracking-wide mb-2">
                Detected PGN Metadata
              </p>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
                {metadataEntries.map(([key, value]) => (
                  <div key={key} className="flex justify-between gap-2">
                    <dt className="font-semibold">{key}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          <div>
            <label className="font-bold text-sm uppercase tracking-wide">
              Choose a side
            </label>
          <select
              className="mt-1 w-full py-2 px-3 rounded-lg bg-blue-50"
              value={side}
            onChange={(e) => setSide(e.target.value as BoardOrientation)}
          >
            <option value="white">White</option>
            <option value="black">Black</option>
          </select>
        </div>
        </div>
        <div className="pointer-events-none aspect-square mt-4">
          <Chessground
            width={500}
            height={500}
            contained={true}
            config={{
              fen: fen,
              orientation: side,
            }}
          />
        </div>
      </div>
    );
  };

  const AnnotationPanel = (): JSX.Element => {
    const hasLines = parsedData.lines.length > 0;
    const hasSelected = Boolean(selectedPath);

    return (
      <div className="rounded-lg bg-blue-100 w-11/12 lg:w-3/4 xl:w-2/3 mx-auto p-4">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <h2 className="text-2xl font-bold">Line Annotations</h2>
          <button
            className="px-4 py-2 rounded-full border text-sm font-semibold bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-200"
            onClick={handleImportComments}
          >
            Import comments from PGN
          </button>
        </div>
        {!hasLines && (
          <div className="rounded bg-blue-50 text-blue-800 text-sm p-3 mb-4">
            Add PGN lines first to attach comments to individual moves.
          </div>
        )}
        {hasLines && (
          <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
            <div className="flex flex-wrap gap-2 mb-2">
              <button
                className={`px-3 py-1 rounded-full text-sm border transition ${
                  selectedPath && selectedPath.length === 0
                    ? "bg-blue-600 text-white border-blue-600"
                    : annotations.some((annotation) =>
                        annotation.path.length === 0
                      )
                    ? "bg-amber-100 border-amber-400 text-amber-900"
                    : "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-200"
                }`}
                onClick={() => handleSelectPath([])}
              >
                Starting position
              </button>
            </div>
            {parsedData.lines.map((line, lineIndex) => (
              <div key={lineIndex}>
                <p className="text-sm font-semibold mb-2">
                  Line {lineIndex + 1}
                </p>
                <div className="flex flex-wrap gap-2">
                  {line.map((move, moveIndex) => {
                    const path = line.slice(0, moveIndex + 1);
                    const annotated = annotations.some((annotation) =>
                      pathsEqual(annotation.path, path)
                    );
                    const isActive =
                      selectedPath &&
                      pathsEqual(selectedPath, path);

                    return (
                      <button
                        key={`${lineIndex}-${moveIndex}-${move}`}
                        className={`px-3 py-1 rounded-full text-sm border transition ${
                          isActive
                            ? "bg-blue-600 text-white border-blue-600"
                            : annotated
                            ? "bg-amber-100 border-amber-400 text-amber-900"
                            : "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-200"
                        }`}
                        onClick={() => handleSelectPath(path)}
                      >
                        {formatMoveLabel(move, moveIndex)}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 border-t border-blue-200 pt-4">
          {hasSelected ? (
            <div className="space-y-3">
              <p className="text-sm uppercase tracking-wide text-blue-700">
                Editing: <span className="font-semibold">{formatPath(selectedPath as string[])}</span>
              </p>
              <div>
                <label className="font-semibold text-sm">
                  Annotation label (optional)
                </label>
                <input
                  className="mt-1 w-full py-2 px-3 rounded-lg bg-blue-50"
                  value={annotationLabel}
                  placeholder="Key plan, tactical alert, typical idea..."
                  onChange={(e) => setAnnotationLabel(e.target.value)}
                />
              </div>
              <div>
                <label className="font-semibold text-sm">
                  Comment
                </label>
                <textarea
                  className="mt-1 w-full py-2 px-3 rounded-lg bg-blue-50 resize-y"
                  rows={4}
                  value={annotationComment}
                  placeholder="Describe plans, threats, or evaluations for this position."
                  onChange={(e) => setAnnotationComment(e.target.value)}
                />
              </div>
              <div className="flex flex-wrap gap-2 justify-end">
                <button
                  className="px-4 py-2 rounded-full border text-sm bg-white text-blue-700 border-blue-300 hover:bg-blue-200"
                  onClick={handleAnnotationRemove}
                >
                  Remove
                </button>
                <button
                  className="px-4 py-2 rounded-full text-sm font-semibold bg-blue-600 text-white disabled:bg-blue-300"
                  onClick={handleAnnotationSave}
                  disabled={annotationComment.trim() === ""}
                >
                  Save annotation
                </button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-blue-700">
              Select a move above to attach a new explanation.
            </p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-blue-400">
      <div className="content-center mx-auto my-8">
        <div className="rounded-lg bg-blue-100">
          <h1 className="text-center px-20 py-8 text-4xl">Edit Mode</h1>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6 content-start pb-16">
        <Card />
        <AnnotationPanel />
        <div className="grid md:grid-cols-2 sm:grid-cols-1 gap-4 w-11/12 lg:w-3/4 xl:w-2/3 mx-auto">
          <Link to="/builder">
            <button
              className="rounded-lg bg-blue-100 w-full px-3 py-3 text-2xl"
              onClick={handleSave}
            >
              Save Changes
            </button>
          </Link>

          <button
            className="rounded-lg bg-red-100 text-red-900 w-full px-3 py-3 text-2xl"
            onClick={() => {
              const answer = window.confirm(
                "Are you sure you want to delete this opening?"
              );

              if (!answer) {
                return;
              }

              props.deleteOpenings(openingIndex);
              document.body.scrollTop = document.documentElement.scrollTop = 0;
              navigate("/builder");
            }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default Edit;
