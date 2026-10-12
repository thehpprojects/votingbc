// ======================================
// VoteChain Admin - Results
// ======================================

import { useWallet } from "../../hooks/useWallet";
import ResultsPage from "../ResultsPage";

export default function AdminResults() {
  const wallet = useWallet();

  return (
    <div className="space-y-6">
      {/* ======================================
          ELECTION SELECTOR
      ====================================== */}

      <div className="card rounded-2xl p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Select Election
            </h2>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Select which election results you want to view.
            </p>
          </div>

          <select
            value={wallet.selectedElectionId || ""}
            onChange={(event) => {
              wallet.selectElection(event.target.value);
            }}
            disabled={wallet.electionsLoading}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white sm:w-80"
          >
            {wallet.elections.map((election) => (
              <option key={election.id} value={election.id}>
                {election.name}
              </option>
            ))}
          </select>
        </div>

        {/* Selected election information */}
        {wallet.selectedElection && (
          <div className="mt-4 rounded-xl bg-slate-50 p-4 dark:bg-slate-800/50">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Currently Viewing
            </p>

            <p className="mt-1 font-bold text-slate-900 dark:text-white">
              {wallet.selectedElection.name}
            </p>

            <p className="mt-1 break-all font-mono text-xs text-slate-500 dark:text-slate-400">
              {wallet.contractAddress}
            </p>
          </div>
        )}
      </div>

      {/* ======================================
          SELECTED ELECTION RESULTS
      ====================================== */}

      <ResultsPage wallet={wallet} />
    </div>
  );
}
