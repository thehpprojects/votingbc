// ======================================
// VoteChain Landing Page
// ======================================

import { Link } from "react-router-dom";
import { useContractData } from "../hooks/useContractData";
import Logo from "../components/common/Logo";
import ChakraEmblem from "../components/common/ChakraEmblem";
import Spinner from "../components/common/Spinner";
import {
  FaShieldAlt,
  FaLink,
  FaLock,
  FaChartLine,
  FaVoteYea,
  FaArrowRight,
  FaCheckCircle,
  FaBullhorn,
  FaWallet,
  FaUserCheck,
  FaCube,
} from "react-icons/fa";

const features = [
  {
    icon: FaShieldAlt,
    title: "Tamper-Proof Ballot Box",
    desc: "Every vote is written immutably on the Polygon Amoy blockchain. No authority — not even the Commission — can alter or erase a recorded vote.",
  },
  {
    icon: FaLink,
    title: "Fully Transparent",
    desc: "All voting transactions are publicly verifiable on PolygonScan, enabling independent audit of the election at any time.",
  },
  {
    icon: FaLock,
    title: "One Voter, One Vote",
    desc: "The smart contract enforces a single vote per wallet, structurally eliminating double voting.",
  },
  {
    icon: FaChartLine,
    title: "Live Result Tally",
    desc: "Vote counts update on-chain in real time with progress bars and a live leaderboard until the polling closes.",
  },
];

const steps = [
  {
    icon: FaUserCheck,
    title: "Register",
    desc: "Create your voter record with your Voter ID and verify your identity via OTP.",
  },
  {
    icon: FaWallet,
    title: "Connect Wallet",
    desc: "Link MetaMask. The portal auto-switches to the Polygon Amoy testnet.",
  },
  {
    icon: FaCube,
    title: "Cast Vote",
    desc: "Submit your ballot on-chain. The transaction hash is your voter receipt.",
  },
  {
    icon: FaChartLine,
    title: "View Results",
    desc: "Follow the live tally and the declared winner from the blockchain.",
  },
];

export default function LandingPage() {
  const { election, candidates, loading } = useContractData();

  return (
    <div>
      {/* ================= HERO ================= */}
      <section className="relative overflow-hidden bg-midnight-950">
        {/* glow orbs */}
        <div className="pointer-events-none absolute -left-40 -top-40 h-[28rem] w-[28rem] rounded-full bg-brand-600/30 blur-[120px]" />
        <div className="pointer-events-none absolute -bottom-48 -right-32 h-[30rem] w-[30rem] rounded-full bg-violet-600/25 blur-[130px]" />

        {/* grid overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(148,163,184,0.4) 1px, transparent 1px), linear-gradient(to bottom, rgba(148,163,184,0.4) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
          }}
        />

        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <ChakraEmblem className="pointer-events-none absolute -right-16 -top-16 h-72 w-72 text-white/[0.05]" />
          <div className="mx-auto max-w-4xl text-center">
            <div className="mx-auto flex w-fit animate-float items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 backdrop-blur sm:px-4">
              <ChakraEmblem className="h-5 w-5 shrink-0 text-brand-300" />
              <p className="font-hindi text-[10px] font-semibold tracking-wide text-slate-200 sm:text-xs">
                Blockchain-Based Multi-Election Voting
              </p>
            </div>

            <h1 className="mt-7 text-3xl font-black leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
              Decentralized
              <span className="block bg-gradient-to-r from-brand-300 via-violet-300 to-fuchsia-300 bg-clip-text text-transparent">
                Blockchain E-Voting
              </span>
              System
            </h1>

            <div className="mx-auto mt-6 flex h-1.5 w-44 overflow-hidden rounded-full">
              <div className="flex-1 bg-[#FF9933]" />
              <div className="flex-1 bg-white" />
              <div className="flex-1 bg-[#138808]" />
            </div>

            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
              आपका वोट, आपकी आवाज़ — Every ballot recorded on a{" "}
              <strong className="text-white">
                tamper-proof smart contract
              </strong>
              , every voter verified by{" "}
              <strong className="text-white">OTP</strong>, every result{" "}
              <strong className="text-white">open for public audit</strong>.
            </p>

            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                to="/register"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-violet-600 px-8 py-3.5 text-base font-bold text-white shadow-glow transition hover:from-brand-500 hover:to-violet-500 sm:w-auto"
              >
                <FaVoteYea className="h-5 w-5" /> Get Started
              </Link>
              <Link
                to="/results"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 px-8 py-3.5 text-base font-bold text-white backdrop-blur transition hover:border-white/40 hover:bg-white/10 sm:w-auto"
              >
                Use Head Start <FaArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Trust chips */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-semibold text-slate-300">
              {[
                "OTP Identity Verification",
                "One Wallet — One Vote",
                "Immutable On-Chain Ballots",
                "Publicly Auditable",
              ].map((t) => (
                <span key={t} className="flex items-center gap-1.5">
                  <FaCheckCircle className="h-3.5 w-3.5 text-emerald-400" /> {t}
                </span>
              ))}
            </div>
          </div>

          {/* Live stats */}
          <div className="mx-auto mt-14 grid max-w-4xl grid-cols-1 gap-4 sm:grid-cols-3">
            {[
              {
                label: "Election State",
                value: loading ? "—" : election?.stateLabel || "—",
                tone: "from-brand-500/15 to-violet-500/10 text-brand-300",
              },
              {
                label: "Registered Candidates",
                value: loading ? "—" : (candidates?.length ?? 0),
                tone: "from-emerald-500/15 to-teal-500/10 text-emerald-300",
              },
              {
                label: "Votes Cast",
                value: loading ? "—" : (election?.votesCast ?? 0),
                tone: "from-fuchsia-500/15 to-pink-500/10 text-fuchsia-300",
              },
            ].map((s) => (
              <div
                key={s.label}
                className={`rounded-2xl border border-white/10 bg-gradient-to-br p-5 text-center backdrop-blur ${s.tone}`}
              >
                <p className="font-display text-3xl font-black text-white">
                  {s.value}
                </p>
                <p className="mt-1.5 text-xs uppercase tracking-widest text-slate-400">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* marquee strip */}
        <div className="relative border-t border-white/10 bg-white/5">
          <div className="flex overflow-hidden py-3">
            <div className="flex w-max animate-marquee gap-10 pr-10">
              {[0, 1].map((dup) => (
                <div key={dup} className="flex shrink-0 items-center gap-10">
                  {[
                    "SECURE",
                    "TRANSPARENT",
                    "TAMPER-PROOF",
                    "DECENTRALIZED",
                    "VERIFIABLE",
                    "ONE VOTE ONE WALLET",
                  ].map((t) => (
                    <span
                      key={t}
                      className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-slate-400"
                    >
                      <FaBullhorn className="h-3.5 w-3.5 text-brand-400" /> {t}
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ================= FEATURES ================= */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-sm font-bold uppercase tracking-widest text-brand-600 dark:text-brand-400">
            Key Features
          </p>
          <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl dark:text-white">
            An Election You Can Verify
          </h2>
          <div className="mx-auto mt-4 h-1 w-24 rounded-full bg-gradient-to-r from-brand-600 to-violet-600" />
          <p className="mx-auto mt-4 max-w-xl text-slate-500 dark:text-slate-400">
            Digital convenience with constitutional-grade integrity. These are
            the pillars on which the portal operates.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div
              key={f.title}
              className="group card card-hover rounded-2xl p-6"
            >
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 to-violet-600 text-white shadow-glow">
                <f.icon className="h-6 w-6" />
              </div>
              <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                {f.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ================= HOW TO VOTE ================= */}
      <section className="bg-white py-20 dark:bg-midnight-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-sm font-bold uppercase tracking-widest text-brand-600 dark:text-brand-400">
              How to Vote
            </p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl dark:text-white">
              Vote in 4 Simple Steps
            </h2>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-4">
            {steps.map((s, i) => (
              <div
                key={s.title}
                className="relative rounded-2xl border border-slate-200 bg-slate-50/60 p-6 text-center dark:border-slate-800 dark:bg-midnight-850"
              >
                <span className="absolute right-4 top-4 font-display text-4xl font-black text-slate-200 dark:text-slate-700">
                  0{i + 1}
                </span>
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-600 to-violet-600 text-white shadow-glow">
                  <s.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-white">
                  {s.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-brand-700 via-brand-600 to-violet-700 p-10 text-center sm:p-14">
          <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/10 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-fuchsia-500/20 blur-2xl" />

          <div className="relative">
            <div className="mx-auto w-fit">
              <Logo className="h-12 w-12" textClassName="text-white" />
            </div>
            <h2 className="mx-auto mt-6 max-w-2xl text-3xl font-black text-white sm:text-4xl">
              Secure Your Place in the Digital Electorate
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-brand-100">
              Register now, connect your wallet, and cast a ballot that no power
              can alter.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                to="/register"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-8 py-3.5 text-base font-bold text-brand-700 shadow-xl transition hover:bg-brand-50 sm:w-auto"
              >
                <FaCheckCircle className="h-5 w-5" /> Register Now
              </Link>
              <Link
                to="/about"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/40 px-8 py-3.5 text-base font-bold text-white transition hover:bg-white/10 sm:w-auto"
              >
                Learn About the Portal
              </Link>
            </div>
          </div>
        </div>
      </section>

      {loading && <Spinner />}
    </div>
  );
}
