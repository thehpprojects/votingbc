// ======================================
// VoteChain Voter - Candidate List
// ======================================

import { Link, useOutletContext } from "react-router-dom";
import CandidateCard from "../../components/candidate/CandidateCard";
import EmptyState from "../../components/common/EmptyState";
import Spinner from "../../components/common/Spinner";
import Button from "../../components/common/Button";
import { FaUsers, FaInfoCircle } from "react-icons/fa";

export default function VoterCandidateList() {
  const { wallet } = useOutletContext();
  const { candidates, results, loading, election } = wallet;

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Candidates</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Every candidate is registered on-chain with verifiable metadata.
          </p>
        </div>
        <Link to="/voter/vote">
          <Button disabled={!election?.isActive}>Vote Now</Button>
        </Link>
      </div>

      <div className="flex items-start gap-3 rounded-2xl border border-sky-200 bg-sky-50 p-4 text-sm dark:border-sky-500/30 dark:bg-sky-500/10">
        <FaInfoCircle className="mt-0.5 h-5 w-5 shrink-0 text-sky-600 dark:text-sky-400" />
        <p className="text-sky-700 dark:text-sky-300">
          Click a candidate's metadata link to view their profile stored on IPFS.
          Vote counts shown are live from the blockchain.
        </p>
      </div>

      {loading ? (
        <Spinner size="lg" />
      ) : candidates.length === 0 ? (
        <EmptyState
          icon={FaUsers}
          title="No candidates yet"
          message="The admin will register candidates during the Registration phase. Check back soon!"
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {candidates.map((c) => (
            <CandidateCard
              key={c.id.toString()}
              candidate={c}
              variant="results"
              votesPercent={
                results?.totalVotesCast
                  ? (Number(c.voteCount) / results.totalVotesCast) * 100
                  : 0
              }
              isLeader={
                results?.hasClearLeader && Number(c.id) === results.leadingCandidateId
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}