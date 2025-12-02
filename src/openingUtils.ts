import { BoardOrientation, Opening } from "./Types";

type OpeningDraftBase = Omit<Opening, "id"> & {
  id?: string;
};

export type OpeningDraft = OpeningDraftBase & {
  colorGroup?: BoardOrientation;
  difficulty?: Opening["difficulty"];
  tags?: string[];
};

const generateOpeningId = (): string => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `opening-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

export const ensureOpeningDefaults = (draft: OpeningDraft): Opening => {
  return {
    ...draft,
    id: draft.id ?? generateOpeningId(),
    colorGroup: draft.colorGroup ?? draft.side ?? "white",
    difficulty: draft.difficulty ?? 2,
    tags: draft.tags ?? [],
    summary: draft.summary ?? "",
    annotations: draft.annotations ?? [],
    metadata: draft.metadata ?? {},
  };
};

export const createBlankOpening = (
  side: BoardOrientation = "white"
): Opening => {
  return ensureOpeningDefaults({
    id: undefined,
    name: "",
    created: "",
    fen: "",
    pgn: "",
    side,
    colorGroup: side,
    difficulty: 2,
    tags: [],
    summary: "",
    annotations: [],
    metadata: {},
  });
};

