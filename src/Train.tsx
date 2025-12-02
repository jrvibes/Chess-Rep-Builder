import { useMemo, useState } from "react";
import ChessCard from "./ChessCard";

import { Opening, BoardOrientation } from "./Types";

const Train = (props: {
  openings: Opening[];
  setOpenings: (openings: Opening[]) => void;
}) => {
  const [colorFilter, setColorFilter] = useState<BoardOrientation | "all">(
    "all"
  );

  const deriveColor = (opening: Opening): BoardOrientation => {
    return (opening.colorGroup ?? opening.side ?? "white") as BoardOrientation;
  };

  const filteredOpenings = useMemo(() => {
    if (colorFilter === "all") {
      return props.openings;
    }

    return props.openings.filter(
      (opening) => deriveColor(opening) === colorFilter
    );
  }, [props.openings, colorFilter]);

  const Filters = (): JSX.Element => {
    const options: Array<{ label: string; value: BoardOrientation | "all" }> = [
      { label: "All Repertoires", value: "all" },
      { label: "White", value: "white" },
      { label: "Black", value: "black" },
    ];

    return (
      <div className="flex flex-wrap justify-center gap-3 mx-4 mb-6">
        {options.map((option) => (
          <button
            key={option.value}
            className={`px-4 py-2 rounded-full border text-sm font-semibold transition ${
              colorFilter === option.value
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-200"
            }`}
            onClick={() => setColorFilter(option.value)}
            aria-pressed={colorFilter === option.value}
          >
            {option.label}
          </button>
        ))}
      </div>
    );
  };

  const Cards = (): JSX.Element => {
    let output: JSX.Element[] = [];

    filteredOpenings.forEach((opening) => {
      output.push(
        <ChessCard
          key={opening.id}
          opening={opening}
          link={"/train/opening?=" + opening.name.replace(" ", "_")}
        />
      );
    });

    return (
      <div className="grid grid-cols-1 gap-4 space-y-2 content-start pb-16">
        {output}
        {filteredOpenings.length === 0 && (
          <div className="text-center text-blue-50 text-lg">
            No repertoires match this filter yet.
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-blue-400">
      <div className="content-center mx-auto my-8">
        <div className="rounded-lg bg-blue-100">
          <h1 className="text-center px-20 py-12 text-4xl">
            Repertoires to Practice
          </h1>
        </div>
      </div>
      <Filters />
      <Cards />
    </div>
  );
};

export default Train;
