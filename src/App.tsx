import React, { useState, useEffect } from "react";
import { HashRouter as Router, Route, Routes } from "react-router-dom";

// Import of header and footer
import Header from "./Header";
import Footer from "./Footer";

// Imports of components
import About from "./About";
import Homepage from "./Homepage";
import Builder from "./Builder";
import Edit from "./Edit";
import Practice from "./Practice";
import Train from "./Train";

import { Opening } from "./Types";
import { ensureOpeningDefaults, OpeningDraft } from "./openingUtils";

const openingSeedData: OpeningDraft[] = [
  {
    name: "Scotch Game",
    created: "March 10, 2023",
    fen: "r1bqkbnr/pppp1ppp/2n5/4p3/3PP3/5N2/PPP2PPP/RNBQKB1R b KQkq",
    pgn: "1. e4 e5 2. Nf3 Nc6 3. d4 exd4 (3... d6 4. Bb5 Bd7 5. Nc3 exd4 6. Nxd4) 4. Nxd4 Nxd4 (4... Nf6 5. Nc3 Bb4 6. Nxc6 bxc6 (6... Bxc3+ 7. bxc3 bxc6 8. Bd3 O-O 9. O-O) 7. Bd3) 5. Qxd4",
    side: "white",
    colorGroup: "white",
    difficulty: 2,
    tags: ["e4", "open game", "central break", "tactics"],
    summary:
      "Break in the center immediately and punish slow ...e5 setups. The early queen jump hits g7 and keeps Black tied to the back rank.",
    metadata: {
      eco: "C45",
      opening: "Scotch Game",
      variation: "Classical Variation",
    },
    annotations: [
      {
        id: "scotch-1",
        label: "Central break",
        path: ["e4", "e5", "Nf3", "Nc6", "d4"],
        comment:
          "Strike in the center before Black finishes development. After ...exd4, recapture with the knight to keep the e-file pressure.",
      },
      {
        id: "scotch-2",
        label: "Queen activity",
        path: ["e4", "e5", "Nf3", "Nc6", "d4", "exd4", "Nxd4", "Nxd4", "Qxd4"],
        comment:
          "Qxd4 hits g7 and eyes e5. Meet ...Qf6 with Nc3, gaining a tempo and reinforcing the d5 outpost.",
      },
    ],
  },
  {
    name: "Italian Game",
    created: "April 18, 2022",
    fen: "r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R b KQkq",
    pgn: "1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 4. c3 Nf6 (4... Qe7 5. d4 exd4 (5... Bb6 6. O-O) 6. O-O dxc3 (6... d3 7. b4) 7. Nxc3) 5. d3 d6 (5... a6 6. a4 d6 7. O-O) 6. O-O",
    side: "white",
    colorGroup: "white",
    difficulty: 1,
    tags: ["e4", "giuoco piano", "slow build", "king safety"],
    summary:
      "A patient Italian setup: build with c3, d3, and O-O, then choose between d4 or a kingside pawn storm once development is complete.",
    metadata: {
      eco: "C53",
      opening: "Italian Game",
      variation: "Giuoco Pianissimo",
    },
    annotations: [
      {
        id: "italian-1",
        label: "Prepare d4",
        path: ["e4", "e5", "Nf3", "Nc6", "Bc4", "Bc5", "c3"],
        comment:
          "c3 keeps ...Nb4 under control and supports the eventual d4 break. Don't rush d4 until you're castled.",
      },
      {
        id: "italian-2",
        label: "Flexible plans",
        path: [
          "e4",
          "e5",
          "Nf3",
          "Nc6",
          "Bc4",
          "Bc5",
          "c3",
          "Nf6",
          "d3",
          "d6",
          "O-O",
        ],
        comment:
          "After castling you can choose h3–g4 for kingside space or play for a slow c3-d4 break in the center.",
      },
    ],
  },
  {
    name: "Scandinavian Opening",
    created: "Februrary 20, 2023",
    fen: "rnbqkbnr/ppp1pppp/8/3p4/4P3/8/PPPP1PPP/RNBQKBNR w KQkq",
    pgn: "1. e4 d5 2. exd5 Qxd5 3. Nc3 Qa5 4. d4 (4. Nf3 Nf6 5. d4 c6 6. Bc4 Bf5 7. Bd2 e6 8. Nd5 Qd8 9. Nxf6+ Qxf6) 4... Nf6 5. Nf3 c6 6. Bc4 Bf5",
    side: "black",
    colorGroup: "black",
    difficulty: 2,
    tags: ["e4", "semi-open", "early queen", "solid"],
    summary:
      "Challenge e4 immediately, then retreat the queen to a5 and develop harmoniously. The light-squared bishop belongs on f5 before ...e6.",
    metadata: {
      eco: "B01",
      opening: "Scandinavian Defense",
      variation: "Main Line",
    },
    annotations: [
      {
        id: "scandi-1",
        label: "Safe queen retreat",
        path: ["e4", "d5", "exd5", "Qxd5", "Nc3", "Qa5"],
        comment:
          "After Qa5 the queen stays active and sidesteps tempos from Bd2. Aim for ...c6 and ...Bf5 before castling.",
      },
      {
        id: "scandi-2",
        label: "Carlsbad structure",
        path: [
          "e4",
          "d5",
          "exd5",
          "Qxd5",
          "Nc3",
          "Qa5",
          "d4",
          "Nf6",
          "Nf3",
          "c6",
        ],
        comment:
          "…c6 builds a light-squared wall. Follow with …Bf5, …e6, and queenside castling if White goes for long-term pressure.",
      },
    ],
  },
  {
    name: "Sicilian Defense",
    created: "March 1, 2023",
    fen: "rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w KQkq",
    pgn: "1. e4 c5 2. Nf3 d6 3. d4 (3. Bb5+ Bd7 4. Bxd7+ Qxd7 5. O-O (5. c4 Nc6 6. Nc3 g6 7. d4 cxd4 8. Nxd4 Bg7) 5... Nc6 6. c3 Nf6 7. d4 Nxe4 8. d5 Ne5) 3... cxd4 4. Nxd4 Nf6 5. Nc3 a6",
    side: "black",
    colorGroup: "black",
    difficulty: 3,
    tags: ["e4", "sicilian", "counterattack", "najdorf"],
    summary:
      "A Najdorf starter kit: contest d4 with ...cxd4, chase knights with ...a6, and plan ...e5 or ...e6 depending on White’s setup.",
    metadata: {
      eco: "B90",
      opening: "Sicilian Defense",
      variation: "Najdorf",
    },
    annotations: [
      {
        id: "sicilian-1",
        label: "Symmetry is broken",
        path: ["e4", "c5", "Nf3", "d6", "d4", "cxd4", "Nxd4"],
        comment:
          "Trading on d4 leaves you with the only central pawn. Use ...Nf6 and ...a6 to harass the white knights.",
      },
      {
        id: "sicilian-2",
        label: "…a6 ideas",
        path: [
          "e4",
          "c5",
          "Nf3",
          "d6",
          "d4",
          "cxd4",
          "Nxd4",
          "Nf6",
          "Nc3",
          "a6",
        ],
        comment:
          "…a6 prevents Nb5 and prepares …e5 in one go. Pair it with …e6–…Be7 for Scheveningen structures if you prefer flexibility.",
      },
    ],
  },
  {
    name: "English Opening",
    created: "October 27, 2022",
    fen: "rnbqkbnr/pppp1ppp/8/4p3/2P5/6P1/PP1PPP1P/RNBQKBNR b KQkq",
    pgn: "1. c4 e5 2. g3 Nf6 (2... c6 3. Nf3 e4 4. Nd4 d5 5. cxd5 Qxd5 6. Nc2) 3. Bg2 d5 (3... Bc5 4. d3 O-O 5. Nc3 Re8 6. Nf3) 4. cxd5 Nxd5 5. Nc3 Nb6 (5... Nxc3 6. bxc3) 6. Nf3",
    side: "white",
    colorGroup: "white",
    difficulty: 2,
    tags: ["c4", "flank", "fianchetto", "control dark squares"],
    summary:
      "Use the kingside fianchetto to control dark squares and delay d2-d4. Meeting ...d5 with cxd5 leaves Black with an isolated pawn target.",
    metadata: {
      eco: "A26",
      opening: "English Opening",
      variation: "Closed System",
    },
    annotations: [
      {
        id: "english-1",
        label: "Fianchetto setup",
        path: ["c4", "e5", "g3"],
        comment:
          "After g3-Bg2, pressure the long diagonal and discourage ...d5 breaks unless you are ready to capture and hit the d-pawn.",
      },
      {
        id: "english-2",
        label: "Dark-square grip",
        path: [
          "c4",
          "e5",
          "g3",
          "Nf6",
          "Bg2",
          "d5",
          "cxd5",
          "Nxd5",
          "Nc3",
          "Nb6",
        ],
        comment:
          "After cxd5 you target the d-pawn. Develop with Nf3 and Be3 to clamp down on d5 before expanding on the queenside.",
      },
    ],
  },
];

const opens: Opening[] = openingSeedData.map(ensureOpeningDefaults);

function App(): JSX.Element {
  // lambda function for the sorting of the openings array
  const sortByCreated = (a: Opening, b: Opening) => {
    const date1 = new Date(a.created);
    const date2 = new Date(b.created);

    if (date1 > date2) {
      return -1;
    }

    return 1;
  };

  // sets the state of all the openings based off of saved memory
  let init_opening: Opening[] = [];

  if ("openings" in window.localStorage) {
    const storedOpenings = JSON.parse(
      window.localStorage.getItem("openings") as string
    ) as OpeningDraft[];
    init_opening = storedOpenings.map(ensureOpeningDefaults);

    // init_opening = [...init_opening, ...opens];

    init_opening.sort(sortByCreated);
  } else {
    init_opening = [...opens];

    init_opening.sort(sortByCreated);
  }

  const [openings, setOpenings]: [Opening[], (openings: Opening[]) => void] =
    useState(init_opening);

  // On openings change update that in memory
  useEffect(() => {
    window.localStorage.setItem("openings", JSON.stringify(openings));
  }, [openings]);

  // function passed as a prop to change the opening from state
  function changeOpenings(opening: Opening, index: number): void {
    const updatedOpenings = [
      ...openings.slice(0, index),
      opening,
      ...openings.slice(index + 1, openings.length),
    ];

    updatedOpenings.sort(sortByCreated);

    setOpenings(updatedOpenings);
  }

  // function passed as a prop to delete an opening from state
  function deleteOpenings(index: number): void {
    const updatedOpenings = [
      ...openings.slice(0, index),
      ...openings.slice(index + 1, openings.length),
    ];

    updatedOpenings.sort(sortByCreated);

    setOpenings(updatedOpenings);
  }

  return (
    <React.StrictMode>
      <Router>
        <Header />
        <Routes>
          <Route path="/about" element={<About />} />
          <Route
            path="/builder"
            element={<Builder openings={openings} setOpenings={setOpenings} />}
          />
          <Route
            path="/builder/opening"
            element={
              <Edit
                openings={openings}
                changeOpenings={changeOpenings}
                deleteOpenings={deleteOpenings}
              />
            }
          />
          <Route
            path="/train"
            element={<Train openings={openings} setOpenings={setOpenings} />}
          />
          <Route
            path="/train/opening"
            element={<Practice openings={openings} setOpenings={setOpenings} />}
          />
          <Route path="/*" element={<Homepage />} />
        </Routes>
        <Footer />
      </Router>
    </React.StrictMode>
  );
}

export default App;
