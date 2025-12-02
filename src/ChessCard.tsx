import { Link } from "react-router-dom";
import Chessground from "@react-chess/chessground";
import { BoardOrientation, Opening } from "./Types";

const ChessCard = (props: { opening: Opening; link: string }): JSX.Element => {
  const color = (props.opening.colorGroup ??
    props.opening.side ??
    "white") as BoardOrientation;
  const colorBadgeClass =
    color === "white"
      ? "bg-amber-100 text-amber-900"
      : "bg-slate-800 text-slate-100";

  const difficulty = props.opening.difficulty ?? 2;
  const difficultyLabels = ["Intro", "Core", "Advanced"];
  const difficultyBadgeClass = [
    "bg-emerald-100 text-emerald-900",
    "bg-sky-100 text-sky-900",
    "bg-purple-100 text-purple-900",
  ][Math.min(Math.max(difficulty - 1, 0), 2)];

  return (
    <Link
      to={props.link}
      onClick={() =>
        (document.body.scrollTop = document.documentElement.scrollTop = 0)
      }
    >
      <div className="rounded-lg bg-blue-100 w-2/3 lg:w-1/2 xl:w-1/3  m-auto hover:cursor-pointer select-none">
        <div>
          <h1 className="px-12 py-2 font-bold text-center text-xl">
            {props.opening.name}
          </h1>
          <h2 className="px-12 pb-2 text-center text-sm underline">
            {props.opening.created}
          </h2>
          {props.opening.summary && (
            <p className="px-8 pb-2 text-center text-sm text-blue-900">
              {props.opening.summary}
            </p>
          )}
          <div className="flex flex-wrap justify-center gap-2 pb-2 text-xs font-semibold uppercase tracking-wide">
            <span className={`px-3 py-1 rounded-full ${colorBadgeClass}`}>
              {color === "white" ? "Play as White" : "Play as Black"}
            </span>
            <span className={`px-3 py-1 rounded-full ${difficultyBadgeClass}`}>
              {difficultyLabels[Math.min(Math.max(difficulty - 1, 0), 2)]}
            </span>
            {props.opening.metadata?.eco && (
              <span className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-900">
                ECO {props.opening.metadata.eco}
              </span>
            )}
          </div>
          {(props.opening.tags?.length ?? 0) > 0 && (
            <div className="flex flex-wrap justify-center gap-2 pb-2 px-4">
              {props.opening.tags?.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 text-xs rounded-full bg-white text-blue-900 border border-blue-200"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="pointer-events-none aspect-square m-2 pb-2">
          <Chessground
            width={500}
            height={500}
            contained={true}
            config={{
              fen: props.opening.fen,
              orientation: props.opening.side,
            }}
          />
        </div>
      </div>
    </Link>
  );
};

export default ChessCard;
