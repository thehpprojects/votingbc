// ======================================
// Voter - Results
// ======================================

import { useOutletContext } from "react-router-dom";
import ResultsPage from "../ResultsPage";

export default function VoterResults() {
  const { wallet } = useOutletContext();

  return (
    <div>
      <ResultsPage wallet={wallet} />
    </div>
  );
}
