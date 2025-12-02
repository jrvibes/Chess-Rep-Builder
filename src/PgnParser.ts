import { parsePgn, startingPosition } from "chessops/pgn";
import type { ChildNode, Game, PgnNodeData } from "chessops/pgn";

import type { OpeningAnnotation, OpeningMetadata } from "./Types";

export interface ParsedOpeningData {
  lines: string[][];
  annotations: OpeningAnnotation[];
  metadata: OpeningMetadata;
}

const headersToMetadata = (headers: Map<string, string>): OpeningMetadata => {
  const eco = headers.get("ECO") ?? undefined;
  const opening = headers.get("Opening") ?? undefined;
  const variation = headers.get("Variation") ?? undefined;
  const event = headers.get("Event") ?? undefined;
  const site = headers.get("Site") ?? undefined;
  const source =
    headers.get("Annotator") ??
    headers.get("Source") ??
    headers.get("Author") ??
    undefined;

  return {
    ...(eco ? { eco } : {}),
    ...(opening ? { opening } : {}),
    ...(variation ? { variation } : {}),
    ...(event ? { event } : {}),
    ...(site ? { site } : {}),
    ...(source ? { source } : {}),
  };
};

const mergeMetadata = (
  target: OpeningMetadata,
  source: OpeningMetadata
): void => {
  (Object.keys(source) as Array<keyof OpeningMetadata>).forEach((key) => {
    if (!target[key] && source[key]) {
      target[key] = source[key];
    }
  });
};

const collectNodeComments = (
  node: ChildNode<PgnNodeData>,
  path: string[],
  annotations: OpeningAnnotation[],
  annotationId: () => string
): void => {
  const payload = [
    ...(node.data.startingComments ?? []),
    ...(node.data.comments ?? []),
  ];

  payload
    .map((comment) => comment?.trim())
    .filter((comment): comment is string => Boolean(comment))
    .forEach((commentText) => {
      annotations.push({
        id: annotationId(),
        path: [...path],
        comment: commentText,
      });
    });
};

const walkNode = (
  node: ChildNode<PgnNodeData>,
  path: string[],
  lines: string[][],
  annotations: OpeningAnnotation[],
  annotationId: () => string
): void => {
  const san = node.data?.san;

  if (!san) {
    node.children.forEach((child) =>
      walkNode(child as ChildNode<PgnNodeData>, path, lines, annotations, annotationId)
    );
    return;
  }

  const currentPath = [...path, san];
  collectNodeComments(node, currentPath, annotations, annotationId);

  if (node.children.length === 0) {
    lines.push(currentPath);
    return;
  }

  node.children.forEach((child) =>
    walkNode(child as ChildNode<PgnNodeData>, currentPath, lines, annotations, annotationId)
  );
};

const collectGameData = (
  game: Game<PgnNodeData>,
  lines: string[][],
  annotations: OpeningAnnotation[],
  metadata: OpeningMetadata,
  annotationId: () => string
): void => {
  startingPosition(game.headers).unwrap();
  mergeMetadata(metadata, headersToMetadata(game.headers));

  const rootComments = game.comments ?? [];
  rootComments
    .map((comment) => comment?.trim())
    .filter((comment): comment is string => Boolean(comment))
    .forEach((comment) => {
      annotations.push({
        id: annotationId(),
        path: [],
        comment,
        label: "Intro",
      });
    });

  for (const child of game.moves.children) {
    walkNode(child as ChildNode<PgnNodeData>, [], lines, annotations, annotationId);
  }
};

export const parseOpeningPgn = (pgn: string): ParsedOpeningData => {
  const games = parsePgn(pgn);
  const lines: string[][] = [];
  const annotations: OpeningAnnotation[] = [];
  const metadata: OpeningMetadata = {};
  let annotationCounter = 0;

  const nextAnnotationId = () => `annot-${annotationCounter++}`;

  for (const game of games) {
    collectGameData(game, lines, annotations, metadata, nextAnnotationId);
  }

  return { lines, annotations, metadata };
};

const parseLines = (pgn: string): string[][] => {
  return parseOpeningPgn(pgn).lines;
};

export default parseLines;
