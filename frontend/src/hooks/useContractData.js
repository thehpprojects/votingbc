// ======================================
// Contract Data Hook (lightweight read data)
// ======================================

import { useEffect, useState, useCallback } from "react";
import {
  fetchElectionStatus,
  fetchCandidates,
  fetchResults,
} from "../services/contract";

/**
 * Loads on-chain election data for pages that do not need the full wallet.
 * @param {number} refreshKey change to trigger a reload
 */
export function useContractData(refreshKey = 0) {
  const [data, setData] = useState({
    election: null,
    candidates: [],
    results: null,
    loading: true,
    error: null,
  });

  const reload = useCallback(() => {
    setData((prev) => ({ ...prev, loading: true }));
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const [election, candidates, results] = await Promise.all([
          fetchElectionStatus(),
          fetchCandidates(),
          fetchResults(),
        ]);
        if (!cancelled) {
          setData({ election, candidates, results, loading: false, error: null });
        }
      } catch (error) {
        console.error("useContractData error:", error);
        if (!cancelled) {
          setData({
            election: null,
            candidates: [],
            results: null,
            loading: false,
            error,
          });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  return { ...data, reload };
}
