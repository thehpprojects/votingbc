// ======================================
// VoteChain About Project Page
// ======================================

import { Link } from "react-router-dom";
import {
  FaServer,
  FaFileContract,
  FaReact,
  FaDatabase,
  FaLink,
  FaWallet,
  FaArrowRight,
} from "react-icons/fa";
import { CONTRACT_ADDRESS, CHAIN_ID, RPC_URL } from "../contract/config";
import { shortenAddress } from "../utils/format";
import Badge from "../components/common/Badge";
import Logo from "../components/common/Logo";

const stack = [
  {
    icon: FaReact,
    title: "React (Vite)",
    desc: "Modern component-based UI with Tailwind CSS",
  },
  {
    icon: FaServer,
    title: "Node.js + Express",
    desc: "REST API with JWT auth, OTP & MongoDB",
  },
  { icon: FaDatabase, title: "MongoDB", desc: "Voter registry & OTP storage" },
  {
    icon: FaFileContract,
    title: "Solidity + Hardhat",
    desc: "VotingSystem smart contract, audited pattern",
  },
  {
    icon: FaLink,
    title: "Ethers.js",
    desc: "Seamless wallet & contract interaction",
  },
  {
    icon: FaWallet,
    title: "MetaMask",
    desc: "One wallet, one vote — identity on-chain",
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="max-w-3xl">
        <div className="flex items-center gap-3">
          <Logo className="h-10 w-10" />
          <Badge tone="brand">About the Portal</Badge>
        </div>
        <h1 className="mt-5 text-4xl font-black tracking-tight text-slate-900 sm:text-5xl dark:text-white">
          VoteChain
        </h1>
        <h2 className="mt-1 text-2xl font-bold text-slate-800 dark:text-slate-200">
          Decentralized Blockchain E-Voting System
        </h2>
        <div className="mt-4 h-1 w-32 rounded-full bg-gradient-to-r from-brand-600 to-violet-600" />
        <p className="mt-6 text-lg leading-relaxed text-slate-600 dark:text-slate-400">
          VoteChain stores every vote on the{" "}
          <strong className="text-slate-900 dark:text-white">
            Polygon Amoy testnet
          </strong>{" "}
          as immutable smart contract state. The system combines a traditional
          web backend (registration, OTP identity verification) with blockchain
          guarantees (tamper-proof vote recording, one-vote-per-wallet).
        </p>
      </div>

      {/* Architecture */}
      <div className="mt-14 grid gap-6 lg:grid-cols-3">
        {[
          {
            icon: FaServer,
            color:
              "bg-sky-100 text-sky-600 dark:bg-sky-500/15 dark:text-sky-400",
            title: "1. Backend (Off-chain)",
            items: [
              "Voter registration with unique Voter ID",
              "Email OTP verification (5-minute expiry)",
              "Admin authentication via JWT",
              "Tracks verification & voting status per voter",
            ],
          },
          {
            icon: FaFileContract,
            color:
              "bg-brand-100 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400",
            title: "2. Smart Contract (On-chain)",
            items: [
              "Candidates & votes stored in immutable contract state",
              "Lifecycle: Registration → Active → Ended",
              "One vote per wallet — enforced by the contract",
              "Votes can never be edited or deleted",
            ],
          },
          {
            icon: FaReact,
            color:
              "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400",
            title: "3. Frontend (dApp)",
            items: [
              "React + Vite + Tailwind CSS responsive UI",
              "Axios for backend REST APIs",
              "Ethers.js + MetaMask for contract calls",
              "Auto-switches wallet to Polygon Amoy",
            ],
          },
        ].map((card) => (
          <div key={card.title} className="card card-hover rounded-2xl p-7">
            <div
              className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${card.color}`}
            >
              <card.icon className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {card.title}
            </h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-400">
              {card.items.map((li) => (
                <li key={li} className="flex gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
                  {li}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Contract details */}
      <div className="mt-14 overflow-hidden rounded-2xl bg-midnight-950 p-8">
        <div className="pointer-events-none absolute" />
        <h2 className="text-xl font-bold text-white">Deployed Contract</h2>
        <div className="mt-5 grid gap-4 text-sm sm:grid-cols-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Network
            </p>
            <p className="mt-1 font-mono font-semibold text-brand-300">
              Polygon Amoy (Chain {CHAIN_ID})
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">
              RPC
            </p>
            <p className="mt-1 truncate font-mono font-semibold text-slate-300">
              {RPC_URL}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Contract
            </p>
            <a
              href={`https://amoy.polygonscan.com/address/${CONTRACT_ADDRESS}`}
              target="_blank"
              rel="noreferrer"
              className="mt-1 inline-block font-mono font-semibold text-brand-300 hover:underline"
              title={CONTRACT_ADDRESS}
            >
              {shortenAddress(CONTRACT_ADDRESS, 8)}
            </a>
          </div>
        </div>
      </div>

      {/* Stack */}
      <div className="mt-14">
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
          Technology Stack
        </h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stack.map((t) => (
            <div
              key={t.title}
              className="card card-hover flex items-start gap-4 rounded-xl p-5"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700 dark:bg-midnight-850 dark:text-slate-300">
                <t.icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white">
                  {t.title}
                </h3>
                <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                  {t.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="mt-14 flex flex-col items-center justify-between gap-4 rounded-2xl bg-gradient-to-r from-brand-600 to-violet-600 p-8 sm:flex-row">
        <div>
          <h3 className="text-lg font-bold text-white">Want to participate?</h3>
          <p className="text-sm text-brand-100">
            Register as a voter, get OTP verified, and cast your vote on-chain.
          </p>
        </div>
        <Link
          to="/register"
          className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-brand-700 shadow-lg transition hover:bg-brand-50"
        >
          Register
          <FaArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
