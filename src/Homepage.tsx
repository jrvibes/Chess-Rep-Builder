import { Link } from "react-router-dom";
const workflowSteps = [
  {
    title: "Pick your goals",
    copy: "Tell us who you play and what you want to sharpen so we scope your study plan.",
    icon: "🎯",
  },
  {
    title: "Follow guided lines",
    copy: "We highlight the critical candidate moves, plans, and ideas for every branch.",
    icon: "🧭",
  },
  {
    title: "Practice with confidence",
    copy: "Jump into drills or Train mode to reinforce what you just added to your repertoire.",
    icon: "⚡",
  },
];

// Generates the homepage
const Homepage = (): JSX.Element => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-6 py-16">
        <section className="grid gap-10 rounded-3xl bg-white p-10 shadow-sm lg:grid-cols-2">
          <div className="flex flex-col gap-6">
            <p className="inline-flex w-fit items-center gap-2 rounded-full bg-blue-50 px-4 py-1 text-sm font-semibold text-blue-700">
              Guided repertoire builder
            </p>
            <div className="space-y-4">
              <h1 className="text-4xl font-bold leading-tight text-slate-900 lg:text-5xl">
                Build a confident chess plan one guided step at a time.
              </h1>
              <p className="text-lg text-slate-600">
                New to building a repertoire? We walk you through each decision
                so you can focus on understanding the ideas, not memorizing the
                moves list.
              </p>
            </div>
            <ul className="space-y-3 text-base text-slate-700">
              {[
                "Pick matchups and skill goals for personalized suggestions.",
                "See the reasoning behind every recommended line.",
                "Practice right away so the moves stick faster.",
              ].map((bullet) => (
                <li key={bullet} className="flex items-start gap-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-blue-500" />
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Link
                to="/builder"
                className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-6 py-3 text-base font-semibold text-white shadow-md shadow-blue-600/30 transition hover:bg-blue-700"
              >
                Start building
              </Link>
              <Link
                to="/about"
                className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-6 py-3 text-base font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
              >
                See how it works
              </Link>
            </div>
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-blue-600 via-blue-500 to-sky-400 p-8 text-white shadow-lg">
            <p className="text-sm uppercase tracking-wide text-blue-100">
              Why players love it
            </p>
            <h2 className="mt-4 text-2xl font-semibold">
              “The guided prompts make complex openings feel manageable. I know
              what I’m aiming for in every position.”
            </h2>
            <p className="mt-6 text-sm text-blue-100">
              – Bailey, 1300 rapid player refining their first White repertoire
            </p>
            <div className="mt-10 grid gap-6 rounded-2xl bg-white/10 p-6 backdrop-blur">
              <div>
                <p className="text-xs uppercase tracking-wide text-blue-100">
                  Progress today
                </p>
                <p className="text-3xl font-bold">12 new lines saved</p>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Practice streak</span>
                <span className="font-semibold">5 days</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Confidence boost</span>
                <span className="font-semibold">+18%</span>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-3xl bg-white p-10 shadow-sm">
          <div className="space-y-3 text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-blue-600">
              Guided workflow
            </p>
            <h2 className="text-3xl font-bold text-slate-900">
              Understand, add, and drill new ideas in minutes.
            </h2>
            <p className="text-slate-600">
              Follow this simple flow to keep learning momentum no matter your
              rating.
            </p>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {workflowSteps.map(({ title, copy, icon }) => (
              <div
                key={title}
                className="rounded-2xl border border-slate-100 bg-slate-50/80 p-6 text-left"
              >
                <span className="text-3xl">{icon}</span>
                <h3 className="mt-4 text-xl font-semibold text-slate-900">
                  {title}
                </h3>
                <p className="mt-2 text-sm text-slate-600">{copy}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-8 rounded-3xl bg-gradient-to-br from-blue-600 to-blue-500 p-8 text-white md:grid-cols-[2fr,1fr]">
          <div className="space-y-4">
            <p className="text-sm uppercase tracking-wider text-blue-100">
              Ready when you are
            </p>
            <h2 className="text-3xl font-bold">
              Jump back into your builder or drill the lines you just added.
            </h2>
            <p className="text-blue-50">
              We save every branch with notes, so the Practice tab knows exactly
              what to quiz you on next.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <Link
              to="/builder"
              className="inline-flex items-center justify-center rounded-2xl bg-white px-5 py-3 text-base font-semibold text-blue-600 transition hover:bg-blue-50"
            >
              Resume builder
            </Link>
            <Link
              to="/train"
              className="inline-flex items-center justify-center rounded-2xl bg-blue-700/40 px-5 py-3 text-base font-semibold text-white transition hover:bg-blue-700/60"
            >
              Start practice
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Homepage;
